"use client";

import { Button } from "@/components/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Edit2Icon, PlusCircle, RefreshCcw, Trash } from "lucide-react";
import useSWR from "swr";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import {
  getTypeLabel,
  isScheduleTypeSlug,
  slugToType,
} from "@/lib/schedule-type";
import FormDrawer from "@/components/form-drawer";
import EmptyState from "@/components/empty-state";
import toast from "react-hot-toast";
import { Select } from "@/components/select";
import { formInputClassName } from "@/components/form-field-styles";
import { cn } from "@/lib/utils";
import { axiosFetcher, isSwrPending, swrDefaults } from "@/lib/swr";
import AppCard, { cardGridClass } from "@/components/app-card";
import { CardGridSkeleton } from "@/components/skeleton";
import AppDashboard, { AppDashboardHeader } from "@/components/app-dashboard";
import { Instructor, ScheduleTypeEnum } from "@/lib/types";

const scheduleTypeOptions = [
  {
    value: ScheduleTypeEnum.PROSTHODONTIST,
    label: "Prostodonsia",
  },
  {
    value: ScheduleTypeEnum.MAKSILOFASIAL,
    label: "Bedah Mulut",
  },
];

export default function InstructorTypeAdminPage() {
  const params = useParams();
  const typeParam = params.type;
  const typeSlug =
    typeof typeParam === "string" && isScheduleTypeSlug(typeParam)
      ? typeParam
      : null;
  const apiType = typeSlug ? slugToType(typeSlug) : null;

  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [name, setName] = useState("");
  const [instructorType, setInstructorType] = useState<ScheduleTypeEnum | "">(
    apiType ?? "",
  );

  const [selectedInstructor, setSelectedInstructor] = useState<
    Instructor | undefined
  >(undefined);

  useEffect(() => {
    if (apiType) {
      setInstructorType(apiType);
    }
  }, [apiType]);

  const swrKey = apiType ? `/api/instructor?type=${apiType}` : null;

  const { data, isLoading, isValidating, mutate } = useSWR<Instructor[]>(
    swrKey,
    axiosFetcher,
    swrDefaults,
  );

  const resetCreateMode = () => {
    setIsCreateMode(false);
    setName("");
    setInstructorType(apiType ?? "");
  };

  const resetEditMode = () => {
    setIsEditMode(false);
    setSelectedInstructor(undefined);
  };

  const handleCreate = async () => {
    if (!name.trim() || !instructorType) return;

    const payload = {
      name: name.trim(),
      type: instructorType,
    };

    resetCreateMode();
    const toastId = toast.loading("Creating instructor...");
    try {
      const response = await axios.post("/api/instructor", payload);
      mutate((current) =>
        current ? [response.data, ...current] : [response.data],
      );
      toast.success("Instructor created successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create instructor", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleEdit = async () => {
    if (!selectedInstructor?.id || !selectedInstructor.name.trim()) return;

    const toastId = toast.loading("Updating instructor...");
    try {
      const response = await axios.put(
        `/api/instructor/${selectedInstructor.id}`,
        {
          name: selectedInstructor.name.trim(),
          type: selectedInstructor.type,
        },
      );

      mutate((current) =>
        current?.map((instructor) =>
          instructor.id === selectedInstructor.id ? response.data : instructor,
        ),
      );
      resetEditMode();
      toast.success("Instructor updated successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update instructor", { id: toastId });
    } finally {
      mutate();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this instructor?")) {
      return;
    }

    const toastId = toast.loading("Deleting instructor...");
    try {
      await axios.delete(`/api/instructor/${id}`);
      mutate((current) =>
        current?.filter((instructor) => instructor.id !== id),
      );
      toast.success("Instructor deleted successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete instructor", { id: toastId });
    }
  };

  const isPending = isSwrPending(isLoading, isValidating);

  const handleRefresh = async () => {
    const toastId = toast.loading("Refreshing...");
    try {
      await mutate();
      toast.success("Data refreshed", { id: toastId });
    } catch {
      toast.error("Failed to refresh", { id: toastId });
    }
  };

  const typeLabel = apiType ? getTypeLabel(apiType) : "Instructors";

  return (
    <AppDashboard
      header={
        <AppDashboardHeader
          title={typeLabel}
          subtitle="Manage instructor names for category suggestions"
          backLink={{ href: "/admin/instructor", label: "All fields" }}
          actions={
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsCreateMode(true)}
                className="gap-1.5"
              >
                <PlusCircle className="size-4" />
                Create Instructor
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isPending}
                className="gap-1.5 h-10 w-10"
                aria-label="Refresh data"
              >
                <RefreshCcw
                  className={cn("size-4", isPending && "animate-spin")}
                />
              </Button>
            </>
          }
        />
      }
    >
      {isPending ? (
        <CardGridSkeleton count={3} variant="schedule" />
      ) : (
        <div className={cardGridClass}>
          {data?.map((instructor) => (
            <AppCard
              key={instructor.id}
              ribbonLabel={getTypeLabel(instructor.type).toUpperCase()}
              ribbonVariant="active"
              title={instructor.name}
              actionsClassName="flex flex-col gap-0"
              actions={
                <>
                  <div className="flex w-full flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-w-0 flex-1 rounded-none"
                      onClick={() => {
                        setSelectedInstructor(instructor);
                        setIsEditMode(true);
                      }}
                    >
                      <Edit2Icon size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-w-0 flex-1 rounded-none !text-destructive"
                      onClick={() => handleDelete(instructor.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </>
              }
            />
          ))}
        </div>
      )}

      {!isPending && data?.length === 0 && (
        <EmptyState
          title="No instructors yet"
          description="Create one to get started."
          ctaLabel="Create Instructor"
          onCtaClick={() => setIsCreateMode(true)}
        />
      )}

      <FormDrawer
        open={isCreateMode}
        onOpenChange={(open) => {
          setIsCreateMode(open);
          if (!open) {
            setName("");
            setInstructorType(apiType ?? "");
          }
        }}
        title="Create an Instructor"
        description="Add a new instructor to the suggestion catalog"
        footer={
          <Button
            size="xl"
            className="rounded-sm"
            onClick={handleCreate}
            disabled={!name.trim() || !instructorType}
          >
            Create
          </Button>
        }
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="create-instructor-type"
            className="text-sm font-medium text-gray-700"
          >
            Field
          </Label>
          <Select
            id="create-instructor-type"
            aria-label="Field"
            value={instructorType}
            onValueChange={(value) =>
              setInstructorType(value as ScheduleTypeEnum)
            }
            placeholder="Select field"
            options={scheduleTypeOptions}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="create-instructor-name"
            className="text-sm font-medium text-gray-700"
          >
            Instructor Name
          </Label>
          <Input
            id="create-instructor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Input instructor name"
            className={formInputClassName}
          />
        </div>
      </FormDrawer>

      <FormDrawer
        open={isEditMode}
        onOpenChange={(open) => {
          if (!open) resetEditMode();
          else setIsEditMode(true);
        }}
        title="Update Instructor"
        description="Update instructor details"
        footer={
          <Button
            size="xl"
            className="rounded-sm"
            onClick={handleEdit}
            disabled={!selectedInstructor?.name.trim()}
          >
            Update
          </Button>
        }
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-instructor-type"
            className="text-sm font-medium text-gray-700"
          >
            Field
          </Label>
          <Select
            id="edit-instructor-type"
            aria-label="Field"
            value={selectedInstructor?.type ?? ""}
            onValueChange={(value) =>
              setSelectedInstructor((prev) =>
                prev ? { ...prev, type: value as ScheduleTypeEnum } : prev,
              )
            }
            placeholder="Select field"
            options={scheduleTypeOptions}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="edit-instructor-name"
            className="text-sm font-medium text-gray-700"
          >
            Instructor Name
          </Label>
          <Input
            id="edit-instructor-name"
            value={selectedInstructor?.name ?? ""}
            onChange={(e) =>
              setSelectedInstructor((prev) =>
                prev ? { ...prev, name: e.target.value } : prev,
              )
            }
            placeholder="Input instructor name"
            className={formInputClassName}
          />
        </div>
      </FormDrawer>
    </AppDashboard>
  );
}
