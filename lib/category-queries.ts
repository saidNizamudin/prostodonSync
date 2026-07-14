import supabase from "@/lib/supabase";
import type { CategoryWithParticipants, Participant } from "@/lib/types";

type RawParticipant = {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string;
  deletedAt: string | null;
  coupleId: string | null;
  categoryId: string;
};

export async function fetchCategoriesWithParticipants(scheduleId: string) {
  const { data: categories, error } = await supabase
    .from("Category")
    .select("*")
    .eq("scheduleId", scheduleId)
    .order("createdAt", { ascending: true });

  if (error) throw error;
  if (!categories?.length) return [] as CategoryWithParticipants[];

  const categoryIds = categories.map((category) => category.id);

  const { data: participants, error: participantsError } = await supabase
    .from("People")
    .select("id, name, notes, createdAt, deletedAt, coupleId, categoryId")
    .in("categoryId", categoryIds)
    .order("createdAt", { ascending: true });

  if (participantsError) throw participantsError;

  const coupleIds = [
    ...new Set(
      (participants ?? [])
        .map((participant) => participant.coupleId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const coupleMembersByCoupleId = new Map<
    string,
    { id: string; name: string }[]
  >();

  if (coupleIds.length > 0) {
    const { data: coupleMembers, error: coupleMembersError } = await supabase
      .from("People")
      .select("id, name, coupleId")
      .in("coupleId", coupleIds);

    if (coupleMembersError) throw coupleMembersError;

    for (const member of coupleMembers ?? []) {
      if (!member.coupleId) continue;
      const members = coupleMembersByCoupleId.get(member.coupleId) ?? [];
      members.push({ id: member.id, name: member.name });
      coupleMembersByCoupleId.set(member.coupleId, members);
    }
  }

  const participantsByCategoryId = new Map<string, Participant[]>();

  for (const participant of (participants ?? []) as RawParticipant[]) {
    const mapped: Participant = {
      id: participant.id,
      name: participant.name,
      notes: participant.notes,
      createdAt: participant.createdAt,
      deletedAt: participant.deletedAt,
    };

    if (participant.coupleId) {
      mapped.couple = {
        members: coupleMembersByCoupleId.get(participant.coupleId) ?? [],
      };
    }

    const list = participantsByCategoryId.get(participant.categoryId) ?? [];
    list.push(mapped);
    participantsByCategoryId.set(participant.categoryId, list);
  }

  return categories.map((category) => ({
    ...category,
    participants: participantsByCategoryId.get(category.id) ?? [],
  }));
}
