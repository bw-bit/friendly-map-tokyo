import {
  Accessibility,
  Armchair,
  Baby,
  DoorOpen,
  Ear,
  Languages,
  MoveVertical
} from "lucide-react";
import type { FeatureKey } from "../domain/accessCard";

const icons = {
  wheelchair_access: Accessibility,
  stroller_access: Baby,
  hearing_writing_support: Ear,
  english_menu: Languages,
  step_free: MoveVertical,
  wide_entrance: DoorOpen,
  movable_seating: Armchair
};

export function FeatureIcon({
  feature,
  size = 19
}: {
  feature: FeatureKey;
  size?: number;
}) {
  const Icon = icons[feature];
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} />;
}

