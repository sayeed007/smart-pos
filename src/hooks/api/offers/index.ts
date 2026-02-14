import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OffersService,
  CreateOfferDto,
  UpdateOfferDto,
} from "@/lib/services/backend/offers.service";

export function useOffers() {
  return useQuery({
    queryKey: ["offers", "list"],
    queryFn: () => OffersService.list(),
  });
}

export function useActiveOffers() {
  return useQuery({
    queryKey: ["offers", "active"],
    queryFn: () => OffersService.listActive(),
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ["offers", "detail", id],
    queryFn: () => OffersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOfferDto) => OffersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "list"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "active"] });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOfferDto }) =>
      OffersService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["offers", "list"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "active"] });
      queryClient.invalidateQueries({
        queryKey: ["offers", "detail", data.id],
      });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OffersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"], exact: false });
    },
  });
}
