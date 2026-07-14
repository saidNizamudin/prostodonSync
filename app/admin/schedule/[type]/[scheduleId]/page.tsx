"use client";

import axios from "axios";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Copy,
  Edit2Icon,
  Info,
  Loader,
  PlusCircle,
  RefreshCcw,
  Trash,
} from "lucide-react";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import AppCard, {
  CategorySlotMeta,
  cardGridClass,
} from "@/components/app-card";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";
import EmptyState from "@/components/empty-state";
import useSWR from "swr";
import FormDrawer from "@/components/form-drawer";
import PanelDialog from "@/components/panel-dialog";
import { Textarea } from "@/components/textarea";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ScheduleWithMeta, type CategoryWithParticipants } from "@/lib/types";
import ParticipantDialog from "@/components/participant-dialog";
import {
  CategoryFormFields,
  CategoryFormValues,
} from "@/components/category-form-fields";
import { CardGridSkeleton, Skeleton } from "@/components/skeleton";
import { isScheduleTypeSlug } from "@/lib/schedule-type";
import { axiosFetcher, isSwrPending, swrDefaults } from "@/lib/swr";
import { cn } from "@/lib/utils";

type CategoryType = CategoryWithParticipants;

type ScheduleType = ScheduleWithMeta;

const emptyCategory: CategoryFormValues = {
  title: "",
  instructor: "",
  slot: 0,
  desc: "",
};

export default function CategoryAdminPage() {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [newCategory, setNewCategory] =
    useState<CategoryFormValues>(emptyCategory);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectCategory, setSelectCategory] = useState<CategoryType | null>(
    null,
  );

  const [isSummarizeMode, setIsSummarizeMode] = useState(false);
  const [isLoadingSummarize, setIsLoadingSummarize] = useState(false);
  const [summarizeResult, setSummarizeResult] = useState<string>("");
  const [createSaveToCatalog, setCreateSaveToCatalog] = useState(false);
  const [editSaveToCatalog, setEditSaveToCatalog] = useState(false);

  const params = useParams();
  const typeParam = params.type;
  const typeSlug =
    typeof typeParam === "string" && isScheduleTypeSlug(typeParam)
      ? typeParam
      : undefined;
  const scheduleId = params.scheduleId;
  const scheduleKey =
    typeof scheduleId === "string"
      ? scheduleId
      : Array.isArray(scheduleId)
        ? scheduleId[0]
        : undefined;

  const {
    data: schedule,
    isLoading: scheduleLoading,
    isValidating: scheduleValidating,
    mutate: mutateSchedule,
  } = useSWR<ScheduleType>(
    scheduleKey ? `/api/schedule/${scheduleKey}` : null,
    axiosFetcher,
    swrDefaults,
  );

  const {
    data,
    isLoading: categoriesLoading,
    isValidating: categoriesValidating,
    mutate,
  } = useSWR<CategoryType[]>(
    scheduleKey ? `/api/category?scheduleId=${scheduleKey}` : null,
    axiosFetcher,
    swrDefaults,
  );

  const schedulePending = isSwrPending(scheduleLoading, scheduleValidating);
  const categoriesPending = isSwrPending(
    categoriesLoading,
    categoriesValidating,
  );
  const isRefreshing = schedulePending || categoriesPending;

  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing...");
    try {
      await Promise.all([mutateSchedule(), mutate()]);
      toast.success("Data refreshed", { id: toastId });
    } catch {
      toast.error("Failed to refresh", { id: toastId });
    }
  };

  const saveInstructorToCatalog = async (
    instructorName: string | undefined,
    shouldSave: boolean,
  ) => {
    if (!shouldSave || !instructorName?.trim() || !schedule?.type) return;

    try {
      await axios.post("/api/instructor", {
        name: instructorName.trim(),
        type: schedule.type,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async () => {
    const toastId = toast.loading("Creating category...");
    const payload = { ...newCategory };
    const shouldSaveInstructor = createSaveToCatalog;
    setNewCategory(emptyCategory);
    setCreateSaveToCatalog(false);
    setIsCreateMode(false);

    try {
      const newData = await axios.post("/api/category", {
        scheduleId: scheduleKey,
        payload,
      });
      await saveInstructorToCatalog(payload.instructor, shouldSaveInstructor);
      toast.success("Category has been created", { id: toastId });
      mutate((current) =>
        current ? [...current, newData.data] : [newData.data],
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to create category", { id: toastId });
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this category?")) return;

    const toastId = toast.loading("Deleting category...");
    try {
      await axios.delete(`/api/category/${id}`);
      toast.success("Category has been deleted", { id: toastId });
      mutate((current) => current?.filter((category) => category.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category", { id: toastId });
    }
  };

  const handleEdit = async () => {
    if (!selectCategory?.id) return;
    const payload = { ...selectCategory };
    const shouldSaveInstructor = editSaveToCatalog;
    setIsEditMode(false);
    setSelectCategory(null);
    setEditSaveToCatalog(false);

    const toastId = toast.loading("Editing category...");
    try {
      await axios.put(`/api/category/${payload.id}`, {
        title: payload.title,
        instructor: payload.instructor,
        slot: payload.slot,
        desc: payload.desc,
      });

      await saveInstructorToCatalog(payload.instructor, shouldSaveInstructor);

      mutate((current) =>
        current?.map((category) =>
          category.id === payload.id ? payload : category,
        ),
      );
      toast.success("Category has been edited", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to edit category", { id: toastId });
    }
  };

  const handleSummarize = async () => {
    if (!scheduleKey) return;

    try {
      setIsLoadingSummarize(true);
      const { data: summary } = await axios.post(`/api/summarize`, {
        scheduleId: scheduleKey,
      });

      if (summary) {
        setIsSummarizeMode(true);
        setSummarizeResult(summary);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to summarize data");
    } finally {
      setIsLoadingSummarize(false);
    }
  };

  const isFormValid = (values: CategoryFormValues) =>
    Boolean(values.title?.trim() && values.instructor?.trim() && values.slot);

  const scheduleDateMeta = schedule
    ? `${format(new Date(schedule.open), "dd MMM yyyy, hh:mm a")} – ${format(
        new Date(schedule.closed),
        "hh:mm a",
      )}`
    : undefined;

  const backHref = typeSlug
    ? `/admin/schedule/${typeSlug}`
    : "/admin/schedule";

  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          backLink={{ href: backHref, label: "All schedules" }}
          title={schedule?.title ?? ""}
          subtitle={schedule?.desc ?? undefined}
          meta={scheduleDateMeta}
          badges={
            schedule ? (
              <Badge variant={schedule.isActive ? "success" : "destructive"}>
                {schedule.isActive ? "Active" : "Inactive"}
              </Badge>
            ) : undefined
          }
          actions={
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsCreateMode(true)}
                disabled={!scheduleKey}
                className="gap-1.5"
              >
                <PlusCircle className="size-4" />
                Add Category
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSummarize}
                disabled={isLoadingSummarize || !scheduleKey}
                className="gap-1.5"
              >
                {isLoadingSummarize ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Info className="size-4" />
                )}
                Summarize
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5 h-10 w-10"
                aria-label="Refresh data"
              >
                <RefreshCcw
                  className={cn("size-4", isRefreshing && "animate-spin")}
                />
              </Button>
            </>
          }
        >
          {schedulePending ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-2/3 max-w-sm" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
          ) : !schedule ? (
            <p className="text-sm text-destructive">Schedule not found</p>
          ) : null}
        </AppDashboardHeader>
      }
    >
      {categoriesPending ? (
        <CardGridSkeleton count={3} variant="category" />
      ) : (
        <div className={cardGridClass}>
          {data?.map((category) => {
            if (
              !category ||
              !category.id ||
              !category.title ||
              !category.instructor ||
              !category.slot
            ) {
              return (
                <AppCard
                  key={category?.id ?? Math.random()}
                  error="Something went wrong with this category"
                />
              );
            }

            const activeParticipants = category.participants?.filter(
              (participant) => !participant.deletedAt,
            );
            const slotLeft = category.slot - (activeParticipants?.length || 0);
            const isFull = slotLeft <= 0;
            const isScheduleClosed = schedule && !schedule.isActive;
            const ribbonLabel = isScheduleClosed
              ? "Closed"
              : isFull
                ? "Full"
                : "Open";
            const ribbonVariant = isScheduleClosed
              ? "closed"
              : isFull
                ? "full"
                : "open";

            return (
              <AppCard
                key={category.id}
                ribbonLabel={ribbonLabel}
                ribbonVariant={ribbonVariant}
                title={category.title}
                subtitle={category.instructor}
                description={category.desc ?? undefined}
                actions={
                  <>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="min-w-0 flex-1 rounded-none hover:bg-red-100 !text-red-600"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="min-w-0 flex-1 rounded-none"
                      onClick={() => {
                        setIsEditMode(true);
                        setSelectCategory(category);
                      }}
                    >
                      <Edit2Icon size={16} />
                    </Button>
                    <ParticipantDialog
                      category={category}
                      mutate={mutate}
                      isAdmin
                      triggerClassName="min-w-0 flex-1 rounded-none"
                    />
                  </>
                }
              >
                <CategorySlotMeta slotLeft={slotLeft} slot={category.slot} />
              </AppCard>
            );
          })}
        </div>
      )}

      {!categoriesPending && data?.length === 0 && (
        <EmptyState
          title="No categories yet"
          description="Create one to get started."
          ctaLabel="Add Category"
          onCtaClick={() => setIsCreateMode(true)}
        />
      )}

      <FormDrawer
        open={isCreateMode}
        onOpenChange={(open) => {
          setIsCreateMode(open);
          if (!open) {
            setNewCategory(emptyCategory);
            setCreateSaveToCatalog(false);
          }
        }}
        title="Create a Category"
        description={`Add a new category to ${schedule?.title ?? "this schedule"}`}
        footer={
          <Button
            size="xl"
            className="rounded-sm"
            onClick={handleCreate}
            disabled={!isFormValid(newCategory)}
          >
            Create
          </Button>
        }
      >
        <CategoryFormFields
          values={newCategory}
          onChange={setNewCategory}
          scheduleType={schedule?.type}
          saveToCatalog={createSaveToCatalog}
          onSaveToCatalogChange={setCreateSaveToCatalog}
        />
      </FormDrawer>

      <FormDrawer
        open={isEditMode}
        onOpenChange={(open) => {
          setIsEditMode(open);
          if (!open) {
            setSelectCategory(null);
            setEditSaveToCatalog(false);
          }
        }}
        title="Update Category"
        description={`Update details for ${selectCategory?.title ?? "this category"}`}
        footer={
          <Button
            size="xl"
            className="rounded-sm"
            onClick={handleEdit}
            disabled={!selectCategory || !isFormValid(selectCategory)}
          >
            Update
          </Button>
        }
      >
        <CategoryFormFields
          values={{
            title: selectCategory?.title,
            instructor: selectCategory?.instructor,
            slot: selectCategory?.slot,
            desc: selectCategory?.desc,
          }}
          onChange={(values) =>
            setSelectCategory((prev) => (prev ? { ...prev, ...values } : prev))
          }
          scheduleType={schedule?.type}
          saveToCatalog={editSaveToCatalog}
          onSaveToCatalogChange={setEditSaveToCatalog}
        />
      </FormDrawer>

      <PanelDialog
        open={isSummarizeMode}
        onOpenChange={setIsSummarizeMode}
        title="Summarize & copy"
        description="Edit and copy the generated summary"
        footer={
          <Button
            size="xl"
            className="rounded-sm"
            onClick={() => {
              navigator.clipboard.writeText(summarizeResult);
              toast.success("Copied to clipboard");
            }}
          >
            <Copy size={20} />
            Copy to Clipboard
          </Button>
        }
      >
        <Textarea
          value={summarizeResult}
          onChange={(e) => setSummarizeResult(e.target.value)}
          rows={20}
          className="min-h-[200px] resize-none rounded-md border-2 p-2 text-sm sm:min-h-[300px]"
        />
      </PanelDialog>
    </AppDashboard>
  );
}
