"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { calendarService } from "@/src/services/calendarService";
import type {
  CalendarFilterState,
  CalendarRange,
  CreateScheduledPostDto,
  ScheduledPost,
  UpdateScheduledPostDto,
} from "@/src/types/calendar.types";

interface UseCalendarResult {
  posts: ScheduledPost[];
  total: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  visibleRange: CalendarRange | null;
  setVisibleRange: (range: CalendarRange) => Promise<void>;
  refresh: () => Promise<void>;
  createPost: (payload: CreateScheduledPostDto) => Promise<ScheduledPost>;
  updatePost: (
    id: string,
    payload: UpdateScheduledPostDto,
  ) => Promise<ScheduledPost>;
  movePost: (id: string, scheduledAt: string) => Promise<ScheduledPost>;
  deletePost: (id: string) => Promise<void>;
}

const sortPosts = (posts: ScheduledPost[]) =>
  [...posts].sort(
    (left, right) =>
      new Date(left.scheduledAt).getTime() -
      new Date(right.scheduledAt).getTime(),
  );

const upsertPost = (posts: ScheduledPost[], post: ScheduledPost) => {
  const existingIndex = posts.findIndex((item) => item._id === post._id);

  if (existingIndex === -1) {
    return sortPosts([...posts, post]);
  }

  const nextPosts = [...posts];
  nextPosts[existingIndex] = post;
  return sortPosts(nextPosts);
};

export function useCalendar(filters: CalendarFilterState): UseCalendarResult {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [total, setTotal] = useState(0);
  const [visibleRange, setVisibleRangeState] = useState<CalendarRange | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());

  const fetchRange = useCallback(
    async (range: CalendarRange) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await calendarService.listPosts({
          ...range,
          ...(filters.platform !== "all" ? { platform: filters.platform } : {}),
          ...(filters.status !== "all" ? { status: filters.status } : {}),
        });

        setPosts(sortPosts(response.posts));
        setTotal(response.total);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Erreur lors du chargement du calendrier",
        );
        setPosts([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [filters.platform, filters.status],
  );

  useEffect(() => {
    if (!visibleRange) {
      return;
    }

    void fetchRange(visibleRange);
  }, [fetchRange, visibleRange]);

  const filteredPosts = useMemo(() => {
    if (!deferredSearch) {
      return posts;
    }

    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.caption,
        post.platform,
        post.postType,
        post.status,
        post.notes,
        ...(post.hashtags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredSearch);
    });
  }, [deferredSearch, posts]);

  const setVisibleRange = useCallback(async (range: CalendarRange) => {
    setVisibleRangeState(range);
  }, []);

  const refresh = useCallback(async () => {
    if (!visibleRange) {
      return;
    }

    await fetchRange(visibleRange);
  }, [fetchRange, visibleRange]);

  const createPost = useCallback(async (payload: CreateScheduledPostDto) => {
    setIsMutating(true);
    try {
      const createdPost = await calendarService.createPost(payload);
      setPosts((currentPosts) => upsertPost(currentPosts, createdPost));
      setTotal((currentTotal) => currentTotal + 1);
      return createdPost;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const updatePost = useCallback(
    async (id: string, payload: UpdateScheduledPostDto) => {
      setIsMutating(true);
      try {
        const updatedPost = await calendarService.updatePost(id, payload);
        setPosts((currentPosts) => upsertPost(currentPosts, updatedPost));
        return updatedPost;
      } finally {
        setIsMutating(false);
      }
    },
    [],
  );

  const movePost = useCallback(async (id: string, scheduledAt: string) => {
    setIsMutating(true);
    try {
      const movedPost = await calendarService.movePost(id, { scheduledAt });
      setPosts((currentPosts) => upsertPost(currentPosts, movedPost));
      return movedPost;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      await calendarService.deletePost(id);
      setPosts((currentPosts) =>
        currentPosts.filter((post) => post._id !== id),
      );
      setTotal((currentTotal) => Math.max(0, currentTotal - 1));
    } finally {
      setIsMutating(false);
    }
  }, []);

  return {
    posts: filteredPosts,
    total,
    isLoading,
    isMutating,
    error,
    visibleRange,
    setVisibleRange,
    refresh,
    createPost,
    updatePost,
    movePost,
    deletePost,
  };
}
