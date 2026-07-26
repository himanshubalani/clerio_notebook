"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSource,
  deleteSource,
  listSources,
} from "@/features/sources/actions/sources-actions";
import { queryKeys } from "@/features/conversation/utils/query-keys";

export function useSources(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.sources.byConversation(conversationId ?? "none"),
    queryFn: () => listSources(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: (query) => {
      // Poll every 3 s while any source is still indexing
      const data = query.state.data;
      if (Array.isArray(data) && data.some((s) => s.status === "INDEXING")) {
        return 3000;
      }
      return false;
    },
  });
}

export function useCreateSource(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; type: string; url?: string }) =>
      createSource(conversationId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sources.byConversation(conversationId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not add source");
    },
  });
}

export function useDeleteSource(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSource(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sources.byConversation(conversationId),
      });
      toast.success("Source removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not remove source");
    },
  });
}
