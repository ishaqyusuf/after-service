"use client";

import { EditCustomerSheet } from "./edit-customer-sheet";
import { ScheduleFollowUpSheet } from "./schedule-follow-up-sheet";
import { FollowUpCardSheet } from "./follow-up-card-sheet";
import { TemplateSheet } from "./template-sheet";

export function GlobalSheets() {
  return (
    <>
      <EditCustomerSheet />
      <ScheduleFollowUpSheet />
      <FollowUpCardSheet />
      <TemplateSheet />
    </>
  );
}
