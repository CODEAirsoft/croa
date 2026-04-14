"use client";

import { MemberRegistrationForm } from "@/components/member-registration-form";

type FieldOption = {
  id: string;
  label: string;
};

export function MemberForm({
  fields,
  nextCroaNumber = 1,
}: {
  fields: FieldOption[];
  nextCroaNumber?: number;
}) {
  return <MemberRegistrationForm fields={fields} nextCroaNumber={nextCroaNumber} />;
}
