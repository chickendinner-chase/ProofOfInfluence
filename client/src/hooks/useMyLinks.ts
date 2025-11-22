import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Link {
  id: string;
  title: string;
  url: string;
  visible: boolean;
  position: number;
  clicks: number;
}

export function useMyLinks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: links, isLoading, error, refetch } = useQuery<Link[]>({
    queryKey: ['/api/links'],
    queryFn: async () => {
      const res = await fetch('/api/links', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch links');
      }
      
      return res.json();
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: { title: string; url: string; visible?: boolean }) => {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create link');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/links'] });
      toast({ title: "Link created successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<Link, 'id' | 'clicks'>> }) => {
      const res = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update link');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/links'] });
      toast({ title: "Link updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete link');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/links'] });
      toast({ title: "Link deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reorderLinksMutation = useMutation({
    mutationFn: async (linkIds: string[]) => {
      const res = await fetch('/api/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ linkIds }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to reorder links');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/links'] });
    },
  });

  return {
    links: links || [],
    isLoading,
    error: error as Error | null,
    refetch,
    createLink: createLinkMutation.mutateAsync,
    updateLink: updateLinkMutation.mutateAsync,
    deleteLink: deleteLinkMutation.mutateAsync,
    reorderLinks: reorderLinksMutation.mutateAsync,
    isCreating: createLinkMutation.isPending,
    isUpdating: updateLinkMutation.isPending,
    isDeleting: deleteLinkMutation.isPending,
  };
}

