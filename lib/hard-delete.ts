import supabase from "@/lib/supabase";

async function hardDeleteCouplesByIds(coupleIds: string[]) {
  const uniqueIds = [...new Set(coupleIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return;
  }

  const { error } = await supabase.from("Couple").delete().in("id", uniqueIds);

  if (error) {
    throw error;
  }
}

async function hardDeletePeopleAndCouplesByCategoryIds(categoryIds: string[]) {
  if (categoryIds.length === 0) {
    return;
  }

  const { data: people, error: peopleError } = await supabase
    .from("People")
    .select("id, coupleId")
    .in("categoryId", categoryIds);

  if (peopleError) {
    throw peopleError;
  }

  const coupleIds = (people ?? [])
    .map((person) => person.coupleId)
    .filter((id): id is string => typeof id === "string" && id.length > 0);

  await hardDeleteCouplesByIds(coupleIds);

  const { error: deletePeopleError } = await supabase
    .from("People")
    .delete()
    .in("categoryId", categoryIds);

  if (deletePeopleError) {
    throw deletePeopleError;
  }
}

export async function hardDeleteCategory(categoryId: string) {
  await hardDeletePeopleAndCouplesByCategoryIds([categoryId]);

  const { data, error } = await supabase
    .from("Category")
    .delete()
    .eq("id", categoryId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function hardDeleteSchedule(scheduleId: string) {
  const { data: categories, error: categoriesError } = await supabase
    .from("Category")
    .select("id")
    .eq("scheduleId", scheduleId);

  if (categoriesError) {
    throw categoriesError;
  }

  const categoryIds = (categories ?? []).map((category) => category.id);
  await hardDeletePeopleAndCouplesByCategoryIds(categoryIds);

  if (categoryIds.length > 0) {
    const { error: deleteCategoriesError } = await supabase
      .from("Category")
      .delete()
      .in("id", categoryIds);

    if (deleteCategoriesError) {
      throw deleteCategoriesError;
    }
  }

  const { data, error } = await supabase
    .from("Schedule")
    .delete()
    .eq("id", scheduleId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function hardDeleteInstructor(instructorId: string) {
  const { data, error } = await supabase
    .from("Instructor")
    .delete()
    .eq("id", instructorId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
