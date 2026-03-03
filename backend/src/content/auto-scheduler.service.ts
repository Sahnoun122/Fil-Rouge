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
  seed?: number;
  advice?: AutoScheduleAdvice;
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
  weekdayOnly?: boolean;
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

interface DateSlot {
  date: string;
  time: string;
  minutes: number;
  priority: number;
}

interface AutoScheduleAdvicePlatformRule {
  bestWindows?: string[];
}

interface AutoScheduleAdvice {
  platformRules?: Record<string, AutoScheduleAdvicePlatformRule>;
  weeklyDistribution?: Record<string, Record<string, number>>;
  notes?: string[];
}

@Injectable()
export class AutoSchedulerService {
  private readonly minSpacingMinutes = 90;
  private readonly fallbackWindow = '09:00-21:00';

  private readonly defaultProfile: PlatformProfile = {
    defaultWindows: ['11:00-13:00', '17:00-19:00'],
    preferredDays: [
      AutoScheduleExcludedDay.TUESDAY,
      AutoScheduleExcludedDay.WEDNESDAY,
      AutoScheduleExcludedDay.THURSDAY,
      AutoScheduleExcludedDay.FRIDAY,
      AutoScheduleExcludedDay.MONDAY,
      AutoScheduleExcludedDay.SATURDAY,
      AutoScheduleExcludedDay.SUNDAY,
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
        AutoScheduleExcludedDay.SUNDAY,
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
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.MONDAY,
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
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
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
      weekdayOnly: true,
    },
    x: {
      defaultWindows: ['09:00-11:00', '12:00-14:00', '17:00-19:00'],
      preferredDays: [
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.MONDAY,
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
      ],
    },
    youtube: {
      defaultWindows: ['17:00-21:00'],
      preferredDays: [
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.MONDAY,
      ],
    },
    snapchat: {
      defaultWindows: ['17:00-21:00'],
      preferredDays: [
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.MONDAY,
      ],
    },
    pinterest: {
      defaultWindows: ['20:00-23:00'],
      preferredDays: [
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.MONDAY,
      ],
    },
    threads: {
      defaultWindows: ['12:00-14:00', '18:00-20:00'],
      preferredDays: [
        AutoScheduleExcludedDay.TUESDAY,
        AutoScheduleExcludedDay.WEDNESDAY,
        AutoScheduleExcludedDay.THURSDAY,
        AutoScheduleExcludedDay.FRIDAY,
        AutoScheduleExcludedDay.MONDAY,
        AutoScheduleExcludedDay.SATURDAY,
        AutoScheduleExcludedDay.SUNDAY,
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
    this.assertValidFrequency(inputs.frequencyPerWeek);

    const normalizedPlatforms = this.normalizePlatforms([
      ...(inputs.platforms ?? []),
      ...posts.map((post) => post.platform),
    ]);

    if (!normalizedPlatforms.length) {
      throw new BadRequestException(
        'Aucune plateforme valide disponible pour la planification',
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
    const maxPosts = weekBuckets.length * inputs.frequencyPerWeek;
    if (posts.length > maxPosts) {
      throw new BadRequestException(
        `Planification impossible: ${posts.length} posts pour ${maxPosts} slots hebdomadaires maximum sur la periode`,
      );
    }

    const preferredTimeWindows = this.normalizePreferredTimeWindows(
      inputs.preferredTimeWindows,
    );
    const advice = this.normalizeAdvice(inputs.advice);
    const effectiveTimeWindows = this.mergeTimeWindowsWithAdvice(
      preferredTimeWindows,
      advice,
    );
    const postsByPlatform = this.groupPostsByPlatform(
      posts,
      normalizedPlatforms,
    );
    const distributedPosts = this.distributePostsAcrossWeeks(
      this.buildBalancedPostOrder(postsByPlatform, normalizedPlatforms),
      inputs.frequencyPerWeek,
      weekBuckets,
      advice,
    );

    return this.applySchedule(
      postsByPlatform,
      distributedPosts,
      weekBuckets,
      eligibleDates,
      effectiveTimeWindows,
      inputs.timezone,
      inputs.seed ?? 0,
    );
  }

  private generateSlotsForPlatform(
    platform: string,
    date: string,
    windows: string[],
    allowWeekendOverride = false,
  ): DateSlot[] {
    const profile = this.getPlatformProfile(platform);
    if (profile.weekdayOnly && !allowWeekendOverride && this.isWeekend(date)) {
      return [];
    }

    const sourceWindows = windows.length ? windows : profile.defaultWindows;
    const uniqueSlots = new Map<string, DateSlot>();

    sourceWindows.forEach((window, windowIndex) => {
      const parsedWindow = this.parseTimeWindow(window);
      const preferredMinutes = this.generateWindowMinutes(
        parsedWindow,
        false,
        windowIndex,
      );

      preferredMinutes.forEach((slot, slotIndex) => {
        const key = this.toDateTimeKey(date, slot.time);
        if (!uniqueSlots.has(key)) {
          uniqueSlots.set(key, {
            date,
            time: slot.time,
            minutes: slot.minutes,
            priority: windowIndex * 100 + slotIndex,
          });
        }
      });
    });

    const fallbackWindow = this.parseTimeWindow(this.fallbackWindow);
    const fallbackSlots = this.generateWindowMinutes(
      fallbackWindow,
      true,
      sourceWindows.length,
    );

    fallbackSlots.forEach((slot, slotIndex) => {
      const key = this.toDateTimeKey(date, slot.time);
      if (!uniqueSlots.has(key)) {
        uniqueSlots.set(key, {
          date,
          time: slot.time,
          minutes: slot.minutes,
          priority: 1000 + slotIndex,
        });
      }
    });

    return Array.from(uniqueSlots.values()).sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.minutes - right.minutes;
    });
  }

  private distributePostsAcrossWeeks(
    posts: OrderedPost[],
    frequencyPerWeek: number,
    weekBuckets: WeekBucket[],
    advice?: AutoScheduleAdvice,
  ): Map<number, OrderedPost[]> {
    const distributed = new Map<number, OrderedPost[]>();
    const weeklyCounts = Array.from({ length: weekBuckets.length }, () => 0);
    const weeklyTargets = this.buildWeeklyTargets(
      advice?.weeklyDistribution,
      weekBuckets,
    );

    let weekCursor = 0;
    for (const post of posts) {
      let assigned = false;
      const platformKey = post.platform.toLowerCase();
      const preferredWeekOrder = this.getPreferredWeeksForPlatform(
        platformKey,
        weeklyTargets,
        weeklyCounts,
        frequencyPerWeek,
        weekCursor,
      );

      for (const candidateWeek of preferredWeekOrder) {
        if (weeklyCounts[candidateWeek] >= frequencyPerWeek) {
          continue;
        }

        const weekPosts = distributed.get(candidateWeek) ?? [];
        weekPosts.push(post);
        distributed.set(candidateWeek, weekPosts);
        weeklyCounts[candidateWeek] += 1;
        weekCursor = (candidateWeek + 1) % weekBuckets.length;
        assigned = true;
        break;
      }

      if (!assigned) {
        throw new BadRequestException(
          'La frequence hebdomadaire ne permet pas de repartir tous les posts',
        );
      }
    }

    return distributed;
  }

  private pickNextAvailableSlot(
    dateSlots: DateSlot[],
    usedSlots: DateSlot[],
  ): DateSlot | null {
    for (const candidate of dateSlots) {
      const hasCollision = usedSlots.some(
        (usedSlot) =>
          Math.abs(usedSlot.minutes - candidate.minutes) <
          this.minSpacingMinutes,
      );

      if (!hasCollision) {
        return candidate;
      }
    }

    return null;
  }

  private applySchedule(
    postsByPlatform: Map<string, OrderedPost[]>,
    distributedPosts: Map<number, OrderedPost[]>,
    weekBuckets: WeekBucket[],
    eligibleDates: string[],
    preferredTimeWindows: Record<string, string[]>,
    timezone: string,
    seed: number,
  ): ScheduleAssignment[] {
    if (postsByPlatform.size === 0) {
      return [];
    }

    const assignments: ScheduleAssignment[] = [];
    const usedSlotsByDate = new Map<string, DateSlot[]>();
    const lastScheduledDateByPlatform = new Map<string, string>();

    for (let weekIndex = 0; weekIndex < weekBuckets.length; weekIndex += 1) {
      const bucket = weekBuckets[weekIndex];
      const weekPosts = distributedPosts.get(weekIndex) ?? [];

      for (const post of weekPosts) {
        const platformKey = post.platform.toLowerCase();
        const hasUserOverride = Boolean(
          preferredTimeWindows[platformKey]?.length,
        );
        const rankedWeekDates = this.rankDatesForPlatform(
          bucket.dates,
          post.platform,
          usedSlotsByDate,
          lastScheduledDateByPlatform,
          hasUserOverride,
          seed + assignments.length,
        );

        let pickedSlot = this.tryPickSlotForDates(
          post.platform,
          rankedWeekDates,
          preferredTimeWindows,
          usedSlotsByDate,
          hasUserOverride,
        );

        if (!pickedSlot) {
          const rankedFallbackDates = this.rankDatesForPlatform(
            eligibleDates,
            post.platform,
            usedSlotsByDate,
            lastScheduledDateByPlatform,
            hasUserOverride,
            seed + assignments.length + weekIndex,
          );

          pickedSlot = this.tryPickSlotForDates(
            post.platform,
            rankedFallbackDates,
            preferredTimeWindows,
            usedSlotsByDate,
            hasUserOverride,
          );
        }

        if (!pickedSlot) {
          throw new BadRequestException(
            `Aucun slot disponible pour ${post.platform} dans la periode demandee`,
          );
        }

        const usedSlots = usedSlotsByDate.get(pickedSlot.date) ?? [];
        usedSlots.push(pickedSlot);
        usedSlots.sort((left, right) => left.minutes - right.minutes);
        usedSlotsByDate.set(pickedSlot.date, usedSlots);
        lastScheduledDateByPlatform.set(platformKey, pickedSlot.date);

        assignments.push({
          index: post.index,
          platform: post.platform,
          schedule: {
            date: pickedSlot.date,
            time: pickedSlot.time,
            timezone,
          },
        });
      }
    }

    return assignments.sort((left, right) => left.index - right.index);
  }

  private tryPickSlotForDates(
    platform: string,
    dates: string[],
    preferredTimeWindows: Record<string, string[]>,
    usedSlotsByDate: Map<string, DateSlot[]>,
    hasUserOverride: boolean,
  ): DateSlot | null {
    const platformKey = this.normalizePlatform(platform).toLowerCase();
    const windows =
      preferredTimeWindows[platformKey] ??
      this.getPlatformProfile(platform).defaultWindows;

    for (const date of dates) {
      const dateSlots = this.generateSlotsForPlatform(
        platform,
        date,
        windows,
        hasUserOverride,
      );
      if (!dateSlots.length) {
        continue;
      }

      const pickedSlot = this.pickNextAvailableSlot(
        dateSlots,
        usedSlotsByDate.get(date) ?? [],
      );
      if (pickedSlot) {
        return pickedSlot;
      }
    }

    return null;
  }

  private rankDatesForPlatform(
    dates: string[],
    platform: string,
    usedSlotsByDate: Map<string, DateSlot[]>,
    lastScheduledDateByPlatform: Map<string, string>,
    hasUserOverride: boolean,
    seed: number,
  ): string[] {
    const platformKey = this.normalizePlatform(platform).toLowerCase();
    const profile = this.getPlatformProfile(platform);

    return [...dates].sort((left, right) => {
      const leftScore = this.scoreDate(
        left,
        platformKey,
        profile,
        usedSlotsByDate,
        lastScheduledDateByPlatform,
        hasUserOverride,
        seed,
      );
      const rightScore = this.scoreDate(
        right,
        platformKey,
        profile,
        usedSlotsByDate,
        lastScheduledDateByPlatform,
        hasUserOverride,
        seed,
      );

      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return left.localeCompare(right);
    });
  }

  private scoreDate(
    date: string,
    platformKey: string,
    profile: PlatformProfile,
    usedSlotsByDate: Map<string, DateSlot[]>,
    lastScheduledDateByPlatform: Map<string, string>,
    hasUserOverride: boolean,
    seed: number,
  ): number {
    const weekday = this.getWeekday(date);
    const preferredDayIndex = profile.preferredDays.indexOf(weekday);
    const preferredDayScore =
      preferredDayIndex >= 0 ? 70 - preferredDayIndex * 8 : 8;

    const dailyLoadPenalty = (usedSlotsByDate.get(date)?.length ?? 0) * 14;
    const lastDate = lastScheduledDateByPlatform.get(platformKey);
    const spacingScore = lastDate
      ? Math.min(Math.abs(this.diffInDays(lastDate, date)), 4) * 7
      : 14;

    const weekendPenalty =
      profile.weekdayOnly && !hasUserOverride && this.isWeekend(date) ? 200 : 0;

    const deterministicBias = this.computeDeterministicBias(
      date,
      platformKey,
      seed,
    );

    return (
      preferredDayScore +
      spacingScore +
      deterministicBias -
      dailyLoadPenalty -
      weekendPenalty
    );
  }

  private buildBalancedPostOrder(
    postsByPlatform: Map<string, OrderedPost[]>,
    platformOrder: string[],
  ): OrderedPost[] {
    const order = platformOrder
      .map((platform) => this.normalizePlatform(platform).toLowerCase())
      .filter((platform, index, source) => source.indexOf(platform) === index);

    const clonedBuckets = new Map<string, OrderedPost[]>();
    postsByPlatform.forEach((posts, platform) => {
      clonedBuckets.set(platform, [...posts]);
    });

    const orderedPosts: OrderedPost[] = [];
    while (orderedPosts.length < this.countPosts(postsByPlatform)) {
      const nextPlatforms = order
        .map((platform) => ({
          platform,
          remaining: clonedBuckets.get(platform)?.length ?? 0,
        }))
        .filter((entry) => entry.remaining > 0)
        .sort((left, right) => {
          if (right.remaining !== left.remaining) {
            return right.remaining - left.remaining;
          }

          return order.indexOf(left.platform) - order.indexOf(right.platform);
        });

      if (!nextPlatforms.length) {
        break;
      }

      for (const entry of nextPlatforms) {
        const bucket = clonedBuckets.get(entry.platform);
        const post = bucket?.shift();
        if (post) {
          orderedPosts.push(post);
        }
      }
    }

    return orderedPosts;
  }

  private groupPostsByPlatform(
    posts: GeneratedPost[],
    platformOrder: string[],
  ): Map<string, OrderedPost[]> {
    const grouped = new Map<string, OrderedPost[]>();

    platformOrder.forEach((platform) => {
      grouped.set(this.normalizePlatform(platform).toLowerCase(), []);
    });

    posts.forEach((post, index) => {
      const platform = this.normalizePlatform(post.platform);
      if (!platform) {
        throw new BadRequestException(
          `Plateforme invalide pour generatedPosts[${index}]`,
        );
      }

      const key = platform.toLowerCase();
      const platformPosts = grouped.get(key) ?? [];
      platformPosts.push({ index, platform });
      grouped.set(key, platformPosts);
    });

    return grouped;
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

  private normalizeAdvice(advice?: AutoScheduleAdvice): AutoScheduleAdvice {
    if (!advice || typeof advice !== 'object' || Array.isArray(advice)) {
      return {};
    }

    const platformRules: Record<string, AutoScheduleAdvicePlatformRule> = {};
    const rawPlatformRules =
      advice.platformRules &&
      typeof advice.platformRules === 'object' &&
      !Array.isArray(advice.platformRules)
        ? advice.platformRules
        : {};

    for (const [platform, rule] of Object.entries(rawPlatformRules)) {
      const normalizedPlatform = this.normalizePlatform(platform);
      if (!normalizedPlatform || !rule || typeof rule !== 'object') {
        continue;
      }

      platformRules[normalizedPlatform.toLowerCase()] = {
        bestWindows: Array.isArray(rule.bestWindows)
          ? rule.bestWindows.map((window) => this.normalizeTimeWindow(window))
          : [],
      };
    }

    const weeklyDistribution: Record<string, Record<string, number>> = {};
    const rawWeeklyDistribution =
      advice.weeklyDistribution &&
      typeof advice.weeklyDistribution === 'object' &&
      !Array.isArray(advice.weeklyDistribution)
        ? advice.weeklyDistribution
        : {};

    for (const [weekKey, distribution] of Object.entries(
      rawWeeklyDistribution,
    )) {
      if (
        !distribution ||
        typeof distribution !== 'object' ||
        Array.isArray(distribution)
      ) {
        continue;
      }

      const normalizedDistribution: Record<string, number> = {};
      for (const [platform, count] of Object.entries(distribution)) {
        const normalizedPlatform = this.normalizePlatform(platform);
        const parsedCount = Number(count);
        if (
          !normalizedPlatform ||
          !Number.isInteger(parsedCount) ||
          parsedCount < 0
        ) {
          continue;
        }

        normalizedDistribution[normalizedPlatform.toLowerCase()] = parsedCount;
      }

      weeklyDistribution[weekKey.toLowerCase()] = normalizedDistribution;
    }

    const notes = Array.isArray(advice.notes)
      ? advice.notes
          .filter((note): note is string => typeof note === 'string')
          .map((note) => note.trim())
          .filter((note) => note.length > 0)
      : [];

    return {
      platformRules,
      weeklyDistribution,
      notes,
    };
  }

  private mergeTimeWindowsWithAdvice(
    preferredTimeWindows: Record<string, string[]>,
    advice: AutoScheduleAdvice,
  ): Record<string, string[]> {
    const merged = { ...preferredTimeWindows };

    for (const [platform, rule] of Object.entries(advice.platformRules ?? {})) {
      if (merged[platform]?.length) {
        continue;
      }

      if (rule.bestWindows?.length) {
        merged[platform] = rule.bestWindows;
      }
    }

    return merged;
  }

  private buildWeeklyTargets(
    weeklyDistribution: Record<string, Record<string, number>> | undefined,
    weekBuckets: WeekBucket[],
  ): Array<Record<string, number>> {
    return weekBuckets.map((_, index) => {
      const key = `week${index + 1}`;
      return weeklyDistribution?.[key] ?? {};
    });
  }

  private getPreferredWeeksForPlatform(
    platformKey: string,
    weeklyTargets: Array<Record<string, number>>,
    weeklyCounts: number[],
    frequencyPerWeek: number,
    weekCursor: number,
  ): number[] {
    const indexedWeeks = weeklyTargets.map((weekTarget, index) => ({
      index,
      target: weekTarget[platformKey] ?? 0,
      load: weeklyCounts[index],
      rotationDistance:
        (index - weekCursor + weeklyTargets.length) % weeklyTargets.length,
    }));

    return indexedWeeks
      .sort((left, right) => {
        if (right.target > 0 !== left.target > 0) {
          return Number(right.target > 0) - Number(left.target > 0);
        }

        if (right.target !== left.target) {
          return right.target - left.target;
        }

        if (left.load !== right.load) {
          return left.load - right.load;
        }

        if (left.rotationDistance !== right.rotationDistance) {
          return left.rotationDistance - right.rotationDistance;
        }

        return left.index - right.index;
      })
      .map((entry) => entry.index)
      .filter((index) => weeklyCounts[index] < frequencyPerWeek);
  }

  private generateWindowMinutes(
    window: TimeWindow,
    isFallback: boolean,
    windowIndex: number,
  ): Array<{ time: string; minutes: number }> {
    const step = 30;
    const minutes: number[] = [];

    for (
      let current = this.roundUpToStep(window.startMinutes, step);
      current <= window.endMinutes;
      current += step
    ) {
      minutes.push(current);
    }

    const midpoint = Math.floor((window.startMinutes + window.endMinutes) / 2);
    return minutes
      .sort((left, right) => {
        const leftDistance = Math.abs(left - midpoint);
        const rightDistance = Math.abs(right - midpoint);

        if (leftDistance !== rightDistance) {
          return leftDistance - rightDistance;
        }

        if (isFallback) {
          return left - right;
        }

        return left - right + windowIndex;
      })
      .map((minute) => ({
        time: this.formatMinutes(minute),
        minutes: minute,
      }));
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

      if (!excludedDays.has(this.getWeekday(date))) {
        dates.push(date);
      }
    }

    return dates;
  }

  private buildWeekBuckets(dates: string[]): WeekBucket[] {
    const buckets = new Map<string, string[]>();

    for (const date of dates) {
      const weekKey = this.getWeekStart(date);
      const weekDates = buckets.get(weekKey) ?? [];
      weekDates.push(date);
      buckets.set(weekKey, weekDates);
    }

    return Array.from(buckets.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([weekKey, weekDates]) => ({
        weekKey,
        dates: weekDates.sort((left, right) => left.localeCompare(right)),
      }));
  }

  private countPosts(postsByPlatform: Map<string, OrderedPost[]>): number {
    let total = 0;
    postsByPlatform.forEach((posts) => {
      total += posts.length;
    });
    return total;
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

  private isWeekend(date: string): boolean {
    const weekday = this.getWeekday(date);
    return (
      weekday === AutoScheduleExcludedDay.SATURDAY ||
      weekday === AutoScheduleExcludedDay.SUNDAY
    );
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

  private assertValidFrequency(frequencyPerWeek: number): void {
    if (!Number.isInteger(frequencyPerWeek) || frequencyPerWeek < 1) {
      throw new BadRequestException(
        'frequencyPerWeek invalide: entier superieur ou egal a 1 attendu',
      );
    }
  }

  private computeDeterministicBias(
    date: string,
    platformKey: string,
    seed: number,
  ): number {
    const raw = `${platformKey}|${date}|${seed}`;
    let hash = 0;

    for (let index = 0; index < raw.length; index += 1) {
      hash = (hash * 31 + raw.charCodeAt(index)) % 997;
    }

    return hash % 5;
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

  private roundUpToStep(value: number, step: number): number {
    return Math.ceil(value / step) * step;
  }

  private toDateTimeKey(date: string, time: string): string {
    return `${date} ${time}`;
  }

  private getPlatformProfile(platform: string): PlatformProfile {
    const platformKey = this.normalizePlatform(platform).toLowerCase();
    return this.platformProfiles[platformKey] ?? this.defaultProfile;
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

export type { AutoScheduleAdvice, AutoSchedulerInputs, ScheduleAssignment };
