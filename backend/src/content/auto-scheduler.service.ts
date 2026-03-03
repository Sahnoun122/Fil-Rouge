import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AutoScheduleExcludedDay,
  PreferredTimeWindowsDto,
} from './dto/auto-schedule.dto';
import { GeneratedPost } from './schemas/content-campaign.schema';

interface AutoSchedulerInputs {
  platforms: string[];
  startDate: string;
  endDate: string;
  frequencyPerWeek: number;
  timezone: string;
  preferredTimeWindows?: PreferredTimeWindowsDto | Record<string, string[]>;
  excludedDays?: AutoScheduleExcludedDay[];
}

interface ScheduleAssignment {
  index: number;
  platform: string;
  schedule: {
    date: string;
    time: string;
    timezone: string;
  };
}

interface OrderedPost {
  index: number;
  platform: string;
}

interface WeekBucket {
  weekKey: string;
  dates: string[];
}

interface PlatformProfile {
  defaultWindows: string[];
  preferredDays: AutoScheduleExcludedDay[];
}

interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

interface TimeWindow {
  startMinutes: number;
  endMinutes: number;
}

@Injectable()
export class AutoSchedulerService {
  private readonly defaultProfile: PlatformProfile = {
    defaultWindows: ['11:00-13:00', '17:00-19:00'],
    preferredDays: [
      AutoScheduleExcludedDay.TUESDAY,
      AutoScheduleExcludedDay.WEDNESDAY,
      AutoScheduleExcludedDay.THURSDAY,
      AutoScheduleExcludedDay.FRIDAY,
      AutoScheduleExcludedDay.MONDAY,
      AutoScheduleExcludedDay.SATURDAY,
    ],
  };

  private readonly platformProfiles: Record<string, PlatformProfile> = {
    instagram: {
      defaultWindows: ['12:00-14:00', '18:00-21:00'],
      preferredDays: [
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.MONDAY,
        AutoScheduleExcludedDay.SATURDAY,
      ],
    },
    tiktok: {
      defaultWindows: ['19:00-23:00', '12:00-14:00'],
      preferredDays: [
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
      ],
    },
    facebook: {
      defaultWindows: ['12:00-14:00', '18:00-20:00'],
      preferredDays: [
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.MONDAY,
      ],
    },
    linkedin: {
      defaultWindows: ['08:00-10:00', '12:00-14:00'],
      preferredDays: [
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.MONDAY,
        AutoScheduleExcludedDay.FRIDAY,
      ],
    },
    x: {
      defaultWindows: ['08:00-10:00', '12:00-13:00', '17:00-19:00'],
      preferredDays: [
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.MONDAY,
        AutoScheduleExcludedDay.FRIDAY,
      ],
    },
    youtube: {
      defaultWindows: ['17:00-20:00', '12:00-14:00'],
      preferredDays: [
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
      ],
    },
    snapchat: {
      defaultWindows: ['17:00-20:00', '20:00-22:00'],
      preferredDays: [
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
        AutoScheduleExcludedDay.THURSDAY,
      ],
    },
    pinterest: {
      defaultWindows: ['20:00-22:00', '12:00-14:00'],
      preferredDays: [
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
      ],
    },
    threads: {
      defaultWindows: ['12:00-14:00', '18:00-20:00'],
      preferredDays: [
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.FRIDAY,
      ],
    },
  };

  createSchedule(
    inputs: AutoSchedulerInputs,
    posts: GeneratedPost[],
  ): ScheduleAssignment[] {
    if (!posts.length) {
      throw new BadRequestException(
        'Aucun post genere a planifier pour cette campagne',
      );
    }

    this.assertValidTimezone(inputs.timezone);

    const normalizedPlatforms = this.normalizePlatforms([
      ...(inputs.platforms ?? []),
      ...posts.map((post) => post.platform),
    ]);

    if (!normalizedPlatforms.length) {
      throw new BadRequestException(
        'Aucune plateforme valide disponible pour la planification',
      );
    }

    if (
      !Number.isInteger(inputs.frequencyPerWeek) ||
      inputs.frequencyPerWeek < 1
    ) {
      throw new BadRequestException(
        'frequencyPerWeek invalide: entier superieur ou egal a 1 attendu',
      );
    }

    const excludedDays = new Set(inputs.excludedDays ?? []);
    const eligibleDates = this.buildEligibleDates(
      inputs.startDate,
      inputs.endDate,
      excludedDays,
    );

    if (!eligibleDates.length) {
      throw new BadRequestException(
        'Aucun jour disponible entre startDate et endDate avec les exclusions demandees',
      );
    }

    const weekBuckets = this.buildWeekBuckets(eligibleDates);
    const capacity = weekBuckets.length * inputs.frequencyPerWeek;
    if (posts.length > capacity) {
      throw new BadRequestException(
        `Planification impossible: ${posts.length} posts a placer pour une capacite de ${capacity} slots entre ${inputs.startDate} et ${inputs.endDate} avec frequencyPerWeek=${inputs.frequencyPerWeek}`,
      );
    }

    const preferredTimeWindows = this.normalizePreferredTimeWindows(
      inputs.preferredTimeWindows,
    );
    const orderedPosts = this.buildBalancedPostOrder(
      posts,
      normalizedPlatforms,
    );
    const weekQuotas = this.distributeAcrossWeeks(
      orderedPosts.length,
      weekBuckets.length,
      inputs.frequencyPerWeek,
    );

    const assignments: ScheduleAssignment[] = [];
    const usedDateTimes = new Set<string>();
    const scheduledCountByDate = new Map<string, number>();
    const platformUsageByDate = new Map<string, number>();
    const lastPlatformDate = new Map<string, string>();

    let postCursor = 0;
    for (let weekIndex = 0; weekIndex < weekBuckets.length; weekIndex += 1) {
      const quota = weekQuotas[weekIndex];
      const bucket = weekBuckets[weekIndex];

      for (let offset = 0; offset < quota; offset += 1) {
        const post = orderedPosts[postCursor];
        if (!post) {
          break;
        }

        const schedule = this.findBestScheduleForPost(
          post,
          bucket,
          eligibleDates,
          usedDateTimes,
          scheduledCountByDate,
          platformUsageByDate,
          lastPlatformDate,
          inputs.timezone,
          preferredTimeWindows,
          assignments.length,
        );

        assignments.push({
          index: post.index,
          platform: post.platform,
          schedule,
        });

        usedDateTimes.add(this.toDateTimeKey(schedule.date, schedule.time));
        scheduledCountByDate.set(
          schedule.date,
          (scheduledCountByDate.get(schedule.date) ?? 0) + 1,
        );
        const platformDateKey = this.toPlatformDateKey(
          post.platform,
          schedule.date,
        );
        platformUsageByDate.set(
          platformDateKey,
          (platformUsageByDate.get(platformDateKey) ?? 0) + 1,
        );
        lastPlatformDate.set(post.platform.toLowerCase(), schedule.date);
        postCursor += 1;
      }
    }

    if (assignments.length !== posts.length) {
      throw new BadRequestException(
        'La planification automatique n a pas pu attribuer un horaire a tous les posts',
      );
    }

    return assignments.sort((left, right) => left.index - right.index);
  }

  private buildBalancedPostOrder(
    posts: GeneratedPost[],
    platformOrder: string[],
  ): OrderedPost[] {
    const buckets = new Map<string, OrderedPost[]>();

    posts.forEach((post, index) => {
      const platform = this.normalizePlatform(post.platform);
      if (!platform) {
        throw new BadRequestException(
          `Plateforme invalide pour generatedPosts[${index}]`,
        );
      }

      const key = platform.toLowerCase();
      const existingBucket = buckets.get(key) ?? [];
      existingBucket.push({ index, platform });
      buckets.set(key, existingBucket);
    });

    const normalizedOrder = platformOrder
      .map((platform) => this.normalizePlatform(platform).toLowerCase())
      .filter((platform, index, source) => source.indexOf(platform) === index);

    const ordered: OrderedPost[] = [];
    while (ordered.length < posts.length) {
      const currentPlatforms = normalizedOrder
        .map((platform) => ({
          platform,
          remaining: buckets.get(platform)?.length ?? 0,
        }))
        .filter((entry) => entry.remaining > 0)
        .sort((left, right) => {
          if (right.remaining !== left.remaining) {
            return right.remaining - left.remaining;
          }
          return (
            normalizedOrder.indexOf(left.platform) -
            normalizedOrder.indexOf(right.platform)
          );
        });

      if (!currentPlatforms.length) {
        break;
      }

      for (const entry of currentPlatforms) {
        const bucket = buckets.get(entry.platform);
        if (!bucket?.length) {
          continue;
        }

        const nextPost = bucket.shift();
        if (nextPost) {
          ordered.push(nextPost);
        }
      }
    }

    return ordered;
  }

  private findBestScheduleForPost(
    post: OrderedPost,
    weekBucket: WeekBucket,
    allEligibleDates: string[],
    usedDateTimes: Set<string>,
    scheduledCountByDate: Map<string, number>,
    platformUsageByDate: Map<string, number>,
    lastPlatformDate: Map<string, string>,
    timezone: string,
    preferredTimeWindows: Record<string, string[]>,
    seed: number,
  ): { date: string; time: string; timezone: string } {
    const candidateDates = [...weekBucket.dates].sort((left, right) => {
      const scoreRight = this.scoreDateForPlatform(
        right,
        post.platform,
        scheduledCountByDate,
        platformUsageByDate,
        lastPlatformDate,
      );
      const scoreLeft = this.scoreDateForPlatform(
        left,
        post.platform,
        scheduledCountByDate,
        platformUsageByDate,
        lastPlatformDate,
      );

      if (scoreRight !== scoreLeft) {
        return scoreRight - scoreLeft;
      }

      return left.localeCompare(right);
    });

    const windows = this.resolveTimeWindows(
      post.platform,
      preferredTimeWindows,
    );

    for (const date of candidateDates) {
      const time = this.findAvailableTime(
        date,
        windows,
        usedDateTimes,
        seed,
        scheduledCountByDate.get(date) ?? 0,
      );

      if (time) {
        return { date, time, timezone };
      }
    }

    for (const date of allEligibleDates) {
      const time = this.findAvailableTime(
        date,
        windows,
        usedDateTimes,
        seed + candidateDates.length,
        scheduledCountByDate.get(date) ?? 0,
      );

      if (time) {
        return { date, time, timezone };
      }
    }

    throw new BadRequestException(
      `Aucun horaire disponible pour la plateforme ${post.platform}`,
    );
  }

  private scoreDateForPlatform(
    date: string,
    platform: string,
    scheduledCountByDate: Map<string, number>,
    platformUsageByDate: Map<string, number>,
    lastPlatformDate: Map<string, string>,
  ): number {
    const profile = this.getPlatformProfile(platform);
    const weekday = this.getWeekday(date);
    const preferredDayIndex = profile.preferredDays.indexOf(weekday);
    const weekdayScore =
      preferredDayIndex >= 0 ? 40 - preferredDayIndex * 5 : 8;
    const dateLoadPenalty = (scheduledCountByDate.get(date) ?? 0) * 10;
    const samePlatformPenalty =
      (platformUsageByDate.get(this.toPlatformDateKey(platform, date)) ?? 0) *
      24;

    const previousDate = lastPlatformDate.get(platform.toLowerCase());
    let spacingScore = 12;
    if (previousDate) {
      const diffDays = Math.abs(this.diffInDays(previousDate, date));
      spacingScore = Math.min(diffDays, 4) * 6;
    }

    return weekdayScore + spacingScore - dateLoadPenalty - samePlatformPenalty;
  }

  private resolveTimeWindows(
    platform: string,
    preferredTimeWindows: Record<string, string[]>,
  ): TimeWindow[] {
    const platformKey = this.normalizePlatform(platform).toLowerCase();
    const rawWindows =
      preferredTimeWindows[platformKey] ??
      this.getPlatformProfile(platform).defaultWindows;

    return rawWindows.map((window) => this.parseTimeWindow(window));
  }

  private findAvailableTime(
    date: string,
    windows: TimeWindow[],
    usedDateTimes: Set<string>,
    seed: number,
    dailyLoad: number,
  ): string | null {
    const seedOffsets = [10, 25, 40, 55, 15, 30, 45, 5, 20, 35, 50, 0];

    for (const window of windows) {
      const rotation = (seed + dailyLoad) % seedOffsets.length;
      for (let index = 0; index < seedOffsets.length; index += 1) {
        const offset = seedOffsets[(index + rotation) % seedOffsets.length];
        const candidateMinutes = this.roundToFiveMinutes(
          window.startMinutes + offset,
        );

        if (candidateMinutes > window.endMinutes) {
          continue;
        }

        const candidateTime = this.formatMinutes(candidateMinutes);
        if (!usedDateTimes.has(this.toDateTimeKey(date, candidateTime))) {
          return candidateTime;
        }
      }

      for (
        let minute = this.roundToFiveMinutes(window.startMinutes);
        minute <= window.endMinutes;
        minute += 5
      ) {
        const candidateTime = this.formatMinutes(minute);
        if (!usedDateTimes.has(this.toDateTimeKey(date, candidateTime))) {
          return candidateTime;
        }
      }
    }

    const fallbackWindow: TimeWindow = {
      startMinutes: 8 * 60,
      endMinutes: 21 * 60 + 55,
    };

    for (
      let minute = this.roundToFiveMinutes(fallbackWindow.startMinutes);
      minute <= fallbackWindow.endMinutes;
      minute += 5
    ) {
      const candidateTime = this.formatMinutes(minute);
      if (!usedDateTimes.has(this.toDateTimeKey(date, candidateTime))) {
        return candidateTime;
      }
    }

    return null;
  }

  private normalizePreferredTimeWindows(
    preferredTimeWindows?: PreferredTimeWindowsDto | Record<string, string[]>,
  ): Record<string, string[]> {
    const normalized: Record<string, string[]> = {};
    if (!preferredTimeWindows) {
      return normalized;
    }

    for (const [platform, windows] of Object.entries(preferredTimeWindows)) {
      if (!Array.isArray(windows) || !windows.length) {
        continue;
      }

      const normalizedPlatform = this.normalizePlatform(platform);
      if (!normalizedPlatform) {
        continue;
      }

      normalized[normalizedPlatform.toLowerCase()] = windows.map((window) =>
        this.normalizeTimeWindow(window),
      );
    }

    return normalized;
  }

  private normalizeTimeWindow(value: string): string {
    const match = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/.exec(
      value.trim(),
    );

    if (!match) {
      throw new BadRequestException(
        `Fenetre horaire invalide: ${value}. Format attendu HH:mm-HH:mm`,
      );
    }

    const startMinutes = Number(match[1]) * 60 + Number(match[2]);
    const endMinutes = Number(match[3]) * 60 + Number(match[4]);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException(
        `Fenetre horaire invalide: ${value}. La fin doit etre apres le debut`,
      );
    }

    return `${match[1]}:${match[2]}-${match[3]}:${match[4]}`;
  }

  private parseTimeWindow(value: string): TimeWindow {
    const normalized = this.normalizeTimeWindow(value);
    const [start, end] = normalized.split('-');
    return {
      startMinutes: this.parseTimeToMinutes(start),
      endMinutes: this.parseTimeToMinutes(end),
    };
  }

  private distributeAcrossWeeks(
    totalPosts: number,
    weekCount: number,
    frequencyPerWeek: number,
  ): number[] {
    const quotas = Array.from({ length: weekCount }, () => 0);

    for (let index = 0; index < totalPosts; index += 1) {
      const weekIndex = index % weekCount;
      quotas[weekIndex] += 1;
    }

    if (quotas.some((quota) => quota > frequencyPerWeek)) {
      throw new BadRequestException(
        'La frequence hebdomadaire ne permet pas de repartir tous les posts sur la plage demandee',
      );
    }

    return quotas;
  }

  private buildEligibleDates(
    startDate: string,
    endDate: string,
    excludedDays: Set<AutoScheduleExcludedDay>,
  ): string[] {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    const startTimestamp = Date.UTC(start.year, start.month - 1, start.day);
    const endTimestamp = Date.UTC(end.year, end.month - 1, end.day);

    if (endTimestamp < startTimestamp) {
      throw new BadRequestException(
        'endDate doit etre posterieure ou egale a startDate',
      );
    }

    const dates: string[] = [];
    for (
      let current = startTimestamp;
      current <= endTimestamp;
      current += 24 * 60 * 60 * 1000
    ) {
      const currentDate = new Date(current);
      const date = this.formatDate({
        year: currentDate.getUTCFullYear(),
        month: currentDate.getUTCMonth() + 1,
        day: currentDate.getUTCDate(),
      });
      const weekday = this.getWeekday(date);
      if (!excludedDays.has(weekday)) {
        dates.push(date);
      }
    }

    return dates;
  }

  private buildWeekBuckets(dates: string[]): WeekBucket[] {
    const buckets = new Map<string, string[]>();

    for (const date of dates) {
      const weekKey = this.getWeekStart(date);
      const existingDates = buckets.get(weekKey) ?? [];
      existingDates.push(date);
      buckets.set(weekKey, existingDates);
    }

    return Array.from(buckets.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([weekKey, weekDates]) => ({
        weekKey,
        dates: weekDates.sort((left, right) => left.localeCompare(right)),
      }));
  }

  private getWeekStart(date: string): string {
    const parsed = this.parseDate(date);
    const utcDate = new Date(
      Date.UTC(parsed.year, parsed.month - 1, parsed.day),
    );
    const diffToMonday = (utcDate.getUTCDay() + 6) % 7;
    utcDate.setUTCDate(utcDate.getUTCDate() - diffToMonday);

    return this.formatDate({
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth() + 1,
      day: utcDate.getUTCDate(),
    });
  }

  private getWeekday(date: string): AutoScheduleExcludedDay {
    const parsed = this.parseDate(date);
    const dayIndex = new Date(
      Date.UTC(parsed.year, parsed.month - 1, parsed.day),
    ).getUTCDay();
    const dayMap: AutoScheduleExcludedDay[] = [
      AutoScheduleExcludedDay.SUNDAY,
      AutoScheduleExcludedDay.MONDAY,
      AutoScheduleExcludedDay.TUESDAY,
      AutoScheduleExcludedDay.WEDNESDAY,
      AutoScheduleExcludedDay.THURSDAY,
      AutoScheduleExcludedDay.FRIDAY,
      AutoScheduleExcludedDay.SATURDAY,
    ];

    return dayMap[dayIndex];
  }

  private diffInDays(left: string, right: string): number {
    const leftDate = this.parseDate(left);
    const rightDate = this.parseDate(right);
    const leftTimestamp = Date.UTC(
      leftDate.year,
      leftDate.month - 1,
      leftDate.day,
    );
    const rightTimestamp = Date.UTC(
      rightDate.year,
      rightDate.month - 1,
      rightDate.day,
    );

    return Math.round((rightTimestamp - leftTimestamp) / (24 * 60 * 60 * 1000));
  }

  private assertValidTimezone(timezone: string): void {
    try {
      new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
      }).format(new Date());
    } catch {
      throw new BadRequestException(`Timezone invalide: ${timezone}`);
    }
  }

  private parseDate(value: string): ParsedDate {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) {
      throw new BadRequestException(
        `Date invalide: ${value}. Format attendu YYYY-MM-DD`,
      );
    }

    const parsed: ParsedDate = {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    };

    const candidate = new Date(
      Date.UTC(parsed.year, parsed.month - 1, parsed.day),
    );
    if (
      candidate.getUTCFullYear() !== parsed.year ||
      candidate.getUTCMonth() + 1 !== parsed.month ||
      candidate.getUTCDate() !== parsed.day
    ) {
      throw new BadRequestException(`Date invalide: ${value}`);
    }

    return parsed;
  }

  private formatDate(date: ParsedDate): string {
    return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }

  private parseTimeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map((part) => Number(part));
    return hours * 60 + minutes;
  }

  private formatMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private roundToFiveMinutes(value: number): number {
    return Math.ceil(value / 5) * 5;
  }

  private toDateTimeKey(date: string, time: string): string {
    return `${date} ${time}`;
  }

  private toPlatformDateKey(platform: string, date: string): string {
    return `${platform.toLowerCase()}|${date}`;
  }

  private getPlatformProfile(platform: string): PlatformProfile {
    const normalizedPlatform = this.normalizePlatform(platform).toLowerCase();
    return this.platformProfiles[normalizedPlatform] ?? this.defaultProfile;
  }

  private normalizePlatforms(platforms: string[]): string[] {
    const deduped = new Map<string, string>();

    for (const platform of platforms) {
      const normalizedPlatform = this.normalizePlatform(platform);
      if (!normalizedPlatform) {
        continue;
      }

      deduped.set(normalizedPlatform.toLowerCase(), normalizedPlatform);
    }

    return Array.from(deduped.values());
  }

  private normalizePlatform(platform: string): string {
    const value = platform.trim();
    if (!value) {
      return '';
    }

    const lower = value.toLowerCase();
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('tiktok') || lower.includes('tik tok')) return 'TikTok';
    if (lower.includes('facebook')) return 'Facebook';
    if (lower.includes('linkedin')) return 'LinkedIn';
    if (lower === 'x' || lower.includes('twitter')) return 'X';
    if (lower.includes('youtube')) return 'YouTube';
    if (lower.includes('snapchat') || lower.includes('snap')) return 'Snapchat';
    if (lower.includes('pinterest')) return 'Pinterest';
    if (lower.includes('threads')) return 'Threads';

    return value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
}

export type { AutoSchedulerInputs, ScheduleAssignment };
