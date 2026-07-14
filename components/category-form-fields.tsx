import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import {
  formInputClassName,
  formTextareaClassName,
} from "@/components/form-field-styles";
import { QuantityInput } from "@/components/quantity-input";
import { InstructorField } from "@/components/instructor-field";
import { ScheduleTypeEnum } from "@/lib/types";

export interface CategoryFormValues {
  title?: string;
  instructor?: string;
  slot?: number;
  desc?: string | null;
}

interface CategoryFormFieldsProps {
  values: CategoryFormValues;
  onChange: (values: CategoryFormValues) => void;
  scheduleType?: ScheduleTypeEnum;
  saveToCatalog?: boolean;
  onSaveToCatalogChange?: (checked: boolean) => void;
}

export function CategoryFormFields({
  values,
  onChange,
  scheduleType,
  saveToCatalog,
  onSaveToCatalogChange,
}: CategoryFormFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Category Name</Label>
        <Input
          value={values.title ?? ""}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          placeholder="Input category name"
          className={formInputClassName}
        />
      </div>
      {scheduleType ? (
        <InstructorField
          value={values.instructor ?? ""}
          onChange={(instructor) => onChange({ ...values, instructor })}
          scheduleType={scheduleType}
          saveToCatalog={saveToCatalog}
          onSaveToCatalogChange={onSaveToCatalogChange}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Instructor</Label>
          <Input
            value={values.instructor ?? ""}
            onChange={(e) => onChange({ ...values, instructor: e.target.value })}
            placeholder="Input instructor name"
            className={formInputClassName}
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Slots</Label>
        <QuantityInput
          value={values.slot ?? 0}
          min={0}
          onChange={(slot) => onChange({ ...values, slot })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={values.desc ?? ""}
          onChange={(e) => onChange({ ...values, desc: e.target.value })}
          placeholder="Input category description"
          rows={5}
          className={formTextareaClassName}
        />
      </div>
    </>
  );
}
