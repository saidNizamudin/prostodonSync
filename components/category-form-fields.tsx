import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import {
  formInputClassName,
  formTextareaClassName,
} from "@/components/form-field-styles";
import { QuantityInput } from "@/components/quantity-input";

export interface CategoryFormValues {
  title?: string;
  instructor?: string;
  slot?: number;
  desc?: string;
}

interface CategoryFormFieldsProps {
  values: CategoryFormValues;
  onChange: (values: CategoryFormValues) => void;
}

export function CategoryFormFields({ values, onChange }: CategoryFormFieldsProps) {
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
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Instructor</Label>
        <Input
          value={values.instructor ?? ""}
          onChange={(e) => onChange({ ...values, instructor: e.target.value })}
          placeholder="Input instructor name"
          className={formInputClassName}
        />
      </div>
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
