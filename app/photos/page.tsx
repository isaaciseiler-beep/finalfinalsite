// app/photos/page.tsx — DROP-IN REPLACEMENT
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { Map as MapIcon, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import "mapbox-gl/dist/mapbox-gl.css";
import { createPortal } from "react-dom";
import Container from "@/components/Container";

export const dynamic = "force-static";

// ---------- types & config ----------

type Region = "asia" | "north-america" | "europe" | "oceania";
type Setting = "nature" | "urban";
type Subject =
  | "cars"
  | "people"
  | "mountains"
  | "ocean"
  | "building"
  | "forest"
  | "flora"
  | "random";

type LayoutVariant = "full" | "half" | "window";

type PhotoMeta = {
  id: string;
  src: string;
  alt: string;
  title?: string;
  locationLabel: string;
  region: Region;
  setting: Setting;
  subject: Subject | Subject[];
  latitude: number;
  longitude: number;
  layoutVariant?: LayoutVariant;
};

const basePhoto: Omit<PhotoMeta, "id" | "src" | "layoutVariant"> = {
  alt: "hold",
  title: undefined,
  locationLabel: "hold",
  region: "asia",
  setting: "nature",
  subject: "mountains",
  latitude: 0,
  longitude: 0,
};

const R2_BASE_URL =
  process.env.NEXT_PUBLIC_R2_BASE_URL ??
  "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/photos";

const PHOTO_COUNT = 139;

// lightweight blur placeholder (keeps layout stable + nicer perceived load)
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iOSIgdmlld0JveD0iMCAwIDE2IDkiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjkiIGZpbGw9IiMwYjBiMGIiLz48L3N2Zz4=";

// sizes that naturally flex with a sidebar-controlled layout (no 100vw assumptions)
const FLEX_SIZES =
  "(min-width: 1024px) calc(100vw - var(--sidebar-width, 0px)), 100vw";

// ---------- small helpers (new) ----------

function isHoldText(v: string | null | undefined) {
  const s = (v ?? "").trim().toLowerCase();
  return s.length === 0 || s === "hold";
}

function getPhotoIndex0(photoId: string) {
  // photoId is "image_123"
  const parts = photoId.split("_");
  const n = Number(parts[1]);
  return Number.isFinite(n) ? Math.max(0, n - 1) : 0;
}

function isValidLatLng(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  return true;
}

// r2 keys are case-sensitive; try common extensions before excluding a photo.
const EXT_CANDIDATES = [".JPG", ".jpg", ".jpeg", ".JPEG"] as const;

function hasRealLocation(p: Pick<PhotoMeta, "locationLabel">) {
  return !isHoldText(p.locationLabel);
}

function buildR2Src(id: string, ext: (typeof EXT_CANDIDATES)[number]) {
  return `${R2_BASE_URL}/${id}${ext}`;
}

// ---------- overrides (unchanged) ----------

const photoOverrides: Record<string, Partial<PhotoMeta>> = {
  image_1: {
    title: "purple_sunset",
    locationLabel: "Kakapotahi, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -42.975005,
    longitude: 170.681745,
  },
  image_2: {
    title: "pink_wall",
    locationLabel: "Reykjavík, Iceland",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 64.147,
    longitude: -21.9408,
  },
  image_3: {
    title: "foggy_mountain",
    locationLabel: "Reynisfjara, Iceland",
    region: "europe",
    setting: "urban",
    subject: "mountains",
    latitude: 63.404271,
    longitude: -19.049165,
  },
  image_4: {
    title: "yellow_wall",
    locationLabel: "Lisbon, Portugal",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 38.7167,
    longitude: -9.13333,
  },
  image_5: {
    title: "cars_and_wall",
    locationLabel: "Las Palmas de Gran Canaria, Spain",
    region: "europe",
    setting: "urban",
    subject: "cars",
    latitude: 28.123546,
    longitude: -15.436257,
  },
  image_6: {
    title: "white_and_blue",
    locationLabel: "Las Palmas de Gran Canaria, Spain",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 28.123846,
    longitude: -15.436257,
  },
  image_7: {
    title: "stop",
    locationLabel: "St. Louis, Missouri",
    region: "north-america",
    setting: "urban",
    subject: "random",
    latitude: 38.627003,
    longitude: -90.199402,
  },
  image_8: {
    title: "over_juifen",
    locationLabel: "Juifen, New Taipei, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "building",
    latitude: 25.10957,
    longitude: 121.84424,
  },
  image_9: {
    title: "red_truck",
    locationLabel: "Washington, DC",
    region: "north-america",
    setting: "urban",
    subject: "cars",
    latitude: 38.8951,
    longitude: -77.0364,
  },
  image_10: {
    title: "reflection",
    locationLabel: "Las Palmas de Gran Canaria, Spain",
    region: "europe",
    setting: "urban",
    subject: ["building", "people"],
    latitude: 28.123246,
    longitude: -15.436257,
  },
  image_11: {
    title: "mini",
    locationLabel: "Taipei, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "cars",
    latitude: 25.105497,
    longitude: 121.597366,
  },
  image_12: {
    title: "dark_blue_mountains",
    locationLabel: "Hofn, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.2497,
    longitude: -15.202,
  },
  image_13: {
    title: "dark_blue_road",
    locationLabel: "Hofn, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.25,
    longitude: -15.202,
  },
  image_14: {
    title: "desolite_valley",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.244073,
    longitude: -14.964838,
  },
  image_15: {
    title: "smooth_ocean_horses",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: ["mountains", "ocean"],
    latitude: 64.244373,
    longitude: -14.964838,
  },
  image_16: {
    title: "smooth_ocean",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: ["mountains", "ocean"],
    latitude: 64.243773,
    longitude: -14.964838,
  },
  image_17: {
    title: "smoothest_ocean",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: ["mountains", "ocean"],
    latitude: 64.244673,
    longitude: -14.964838,
  },
  image_18: {
    title: "road_jagged_mountains",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.243473,
    longitude: -14.964838,
  },
  image_19: {
    title: "house_with_mountains",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: ["mountains", "building"],
    latitude: 64.244973,
    longitude: -14.964838,
  },
  image_20: {
    title: "through_the_doorway",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: ["mountains", "building"],
    latitude: 64.243173,
    longitude: -14.964838,
  },
  image_21: {
    title: "windy",
    locationLabel: "Nesjahverfi, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.31439,
    longitude: -15.22521,
  },
  image_22: {
    title: "peek",
    locationLabel: "Nesjahverfi, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.31469,
    longitude: -15.22521,
  },
  image_23: {
    title: "trees_dense",
    locationLabel: "Rapahoe, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "forest",
    latitude: -42.373136,
    longitude: 171.244142,
  },
  image_24: {
    title: "trees_pine",
    locationLabel: "Rapahoe, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "forest",
    latitude: -42.372836,
    longitude: 171.244142,
  },
  image_25: {
    title: "fernies",
    locationLabel: "Rapahoe, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "forest",
    latitude: -42.373436,
    longitude: 171.244142,
  },
  image_26: {
    title: "cliff_ocean",
    locationLabel: "Rapahoe, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "ocean",
    latitude: -42.372536,
    longitude: 171.244142,
  },
  image_27: {
    title: "solitary",
    locationLabel: "Rapahoe, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "ocean",
    latitude: -42.373736,
    longitude: 171.244142,
  },
  image_28: {
    title: "fernies",
    locationLabel: "Greymouth, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -42.4503,
    longitude: 171.2079,
  },
  image_29: {
    title: "power_line",
    locationLabel: "Juifen, New Taipei, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "mountains",
    latitude: 25.10927,
    longitude: 121.84424,
  },
  image_30: {
    title: "wow",
    locationLabel: "Fox River, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "ocean",
    latitude: -42.038,
    longitude: 171.392,
  },
  image_31: {
    title: "alpine_glowing",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.734877,
    longitude: 170.104124,
  },
  image_32: {
    title: "sky_moon",
    locationLabel: "Hanmer Springs, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "random",
    latitude: -42.526243,
    longitude: 172.828825,
  },
  image_33: {
    title: "hanmer",
    locationLabel: "Hanmer Springs, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -42.525943,
    longitude: 172.828825,
  },
  image_34: {
    title: "mush",
    locationLabel: "Collingwood, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "random",
    latitude: -40.676817,
    longitude: 172.683166,
  },
  image_35: {
    title: "bus",
    locationLabel: "Punakaiki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "cars",
    latitude: -42.108415,
    longitude: 171.336313,
  },
  image_36: {
    title: "airplane_water",
    locationLabel: "Half Moon Bay, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "ocean",
    latitude: -46.8908,
    longitude: 168.1528,
  },
  image_37: {
    title: "greenish",
    locationLabel: "Half Moon Bay, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "building",
    latitude: -46.8905,
    longitude: 168.1528,
  },
  image_38: {
    title: "greenish_urinal",
    locationLabel: "Half Moon Bay, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "building",
    latitude: -46.8911,
    longitude: 168.1528,
  },
  image_39: {
    title: "icelanding_yield",
    locationLabel: "Reykjavík, Iceland",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 64.1473,
    longitude: -21.9408,
  },
  image_40: {
    title: "graffwall",
    locationLabel: "Reykjavík, Iceland",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 64.1467,
    longitude: -21.9408,
  },
  image_41: {
    title: "gwaggen",
    locationLabel: "Reykjavík, Iceland",
    region: "europe",
    setting: "urban",
    subject: "cars",
    latitude: 64.1476,
    longitude: -21.9408,
  },
  image_42: {
    title: "stairing",
    locationLabel: "Reykjavík, Iceland",
    region: "europe",
    setting: "urban",
    subject: "random",
    latitude: 64.1464,
    longitude: -21.9408,
  },
  image_43: {
    title: "little_homes",
    locationLabel: "Veiðilundur, Iceland",
    region: "europe",
    setting: "nature",
    subject: ["building", "mountains"],
    latitude: 64.15116,
    longitude: -21.04698,
  },
  image_44: {
    title: "icecar",
    locationLabel: "Vik, Iceland",
    region: "europe",
    setting: "urban",
    subject: "cars",
    latitude: 63.4186,
    longitude: -19.006,
  },
  image_45: {
    title: "stickers",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.245273,
    longitude: -14.964838,
  },
  image_46: {
    title: "orange",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "ocean",
    latitude: 64.242873,
    longitude: -14.964838,
  },
  image_47: {
    title: "peek",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.245573,
    longitude: -14.964838,
  },
  image_48: {
    title: "scaffold",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.242573,
    longitude: -14.964838,
  },
  image_49: {
    title: "even_more_orange",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "building",
    latitude: 64.245873,
    longitude: -14.964838,
  },
  image_50: {
    title: "peak",
    locationLabel: "Stokksnes, Iceland",
    region: "europe",
    setting: "nature",
    subject: "mountains",
    latitude: 64.242273,
    longitude: -14.964838,
  },
  image_51: {
    title: "twilight",
    locationLabel: "Skútafoss & Fremstifoss, Iceland",
    region: "europe",
    setting: "nature",
    subject: ["mountains", "ocean"],
    latitude: 64.3417,
    longitude: -14.9278,
  },
  image_52: {
    title: "jagged",
    locationLabel: "Punakaiki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "ocean",
    latitude: -42.108115,
    longitude: 171.336313,
  },
  image_53: {
    title: "path_stairs",
    locationLabel: "Punakaiki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: ["flora", "mountains"],
    latitude: -42.108715,
    longitude: 171.336313,
  },
  image_54: {
    title: "little_house",
    locationLabel: "Ruatapu, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "building",
    latitude: -42.829,
    longitude: 171.548,
  },
  image_55: {
    title: "ledge",
    locationLabel: "Punakaiki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: ["random", "ocean"],
    latitude: -42.107815,
    longitude: 171.336313,
  },
  image_56: {
    title: "glowing_again",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.734577,
    longitude: 170.104124,
  },
  image_57: {
    title: "winding_away",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.735177,
    longitude: 170.104124,
  },
  image_58: {
    title: "characters",
    locationLabel: "Keelung, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "building",
    latitude: 25.1283,
    longitude: 121.742,
  },
  image_60: {
    title: "greenery",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "flora",
    latitude: -43.734277,
    longitude: 170.104124,
  },
  image_61: {
    title: "tumble",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.735477,
    longitude: 170.104124,
  },
  image_62: {
    title: "wildfires",
    locationLabel: "Twizel, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.2484,
    longitude: 170.0947,
  },
  image_63: {
    title: "hunting_zone",
    locationLabel: "Twizel, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.2481,
    longitude: 170.0947,
  },
  image_64: {
    title: "fields",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.733977,
    longitude: 170.104124,
  },
  image_65: {
    title: "dark_bridge",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.735777,
    longitude: 170.104124,
  },
  image_66: {
    title: "twizel",
    locationLabel: "Twizel, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.2487,
    longitude: 170.0947,
  },
  image_68: {
    title: "through_the_bridge",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.733677,
    longitude: 170.104124,
  },
  image_69: {
    title: "on_the_plane",
    locationLabel: "Aoraki, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -43.736077,
    longitude: 170.104124,
  },
  image_70: {
    title: "pink",
    locationLabel: "Cass Bay, New Zealand",
    region: "oceania",
    setting: "urban",
    subject: "cars",
    latitude: -43.616,
    longitude: 172.72,
  },
  image_71: {
    title: "french_van",
    locationLabel: "Queenstown, New Zealand",
    region: "oceania",
    setting: "urban",
    subject: "cars",
    latitude: -45.031162,
    longitude: 168.662643,
  },
  image_72: {
    title: "purple_ford",
    locationLabel: "Queenstown, New Zealand",
    region: "oceania",
    setting: "urban",
    subject: "cars",
    latitude: -45.030862,
    longitude: 168.662643,
  },
  image_73: {
    title: "vannagain",
    locationLabel: "Queenstown, New Zealand",
    region: "oceania",
    setting: "urban",
    subject: "cars",
    latitude: -45.031462,
    longitude: 168.662643,
  },
  image_74: {
    title: "flutter",
    locationLabel: "Glenorchy, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.85055,
    longitude: 168.388197,
  },
  image_75: {
    title: "future",
    locationLabel: "Glenorchy, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.85025,
    longitude: 168.388197,
  },
  image_78: {
    title: "from_the_boat",
    locationLabel: "Milford Sound, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: ["mountains", "ocean"],
    latitude: -44.6167,
    longitude: 167.8667,
  },
  image_79: {
    title: "fracture",
    locationLabel: "Milford Sound, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "ocean",
    latitude: -44.6164,
    longitude: 167.8667,
  },
  image_80: {
    title: "washed",
    locationLabel: "Glenorchy, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.85085,
    longitude: 168.388197,
  },
  image_81: {
    title: "beater",
    locationLabel: "Oak Ridge, Tennessee",
    region: "north-america",
    setting: "urban",
    subject: "cars",
    latitude: 36.0104,
    longitude: -84.2696,
  },
  image_82: {
    title: "washing",
    locationLabel: "Washington, DC",
    region: "north-america",
    setting: "urban",
    subject: "random",
    latitude: 38.8954,
    longitude: -77.0364,
  },
  image_83: {
    title: "fuck_trump",
    locationLabel: "Washington, DC",
    region: "north-america",
    setting: "urban",
    subject: "random",
    latitude: 38.8948,
    longitude: -77.0364,
  },
  image_84: {
    title: "chair",
    locationLabel: "St. Louis, MO",
    region: "north-america",
    setting: "urban",
    subject: "random",
    latitude: 38.627303,
    longitude: -90.199402,
  },
  image_85: {
    title: "sign",
    locationLabel: "St. Louis, MO",
    region: "north-america",
    setting: "urban",
    subject: "random",
    latitude: 38.626703,
    longitude: -90.199402,
  },
  image_86: {
    title: "cover",
    locationLabel: "St. Louis, MO",
    region: "north-america",
    setting: "urban",
    subject: "random",
    latitude: 38.627603,
    longitude: -90.199402,
  },
  image_87: {
    title: "glow",
    locationLabel: "Washington, DC",
    region: "north-america",
    setting: "urban",
    subject: "building",
    latitude: 38.8957,
    longitude: -77.0364,
  },
  image_88: {
    title: "shoes",
    locationLabel: "New Taipei, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "random",
    latitude: 25.0125,
    longitude: 121.465,
  },
  image_89: {
    title: "rarri",
    locationLabel: "Yangminshan National Park, Taiwan",
    region: "asia",
    setting: "nature",
    subject: "cars",
    latitude: 25.19447,
    longitude: 121.56092,
  },
  image_90: {
    title: "friends_pier",
    locationLabel: "Tamsui, New Taipei, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "ocean",
    latitude: 25.17194,
    longitude: 121.44389,
  },
  image_98: {
    title: "white_wall",
    locationLabel: "Las Palmas de Gran Canaria, Spain",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 28.124146,
    longitude: -15.436257,
  },
  image_99: {
    title: "mary",
    locationLabel: "Lisbon, Portugal",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 38.717,
    longitude: -9.13333,
  },
  image_100: {
    title: "traincar",
    locationLabel: "Lisbon, Portugal",
    region: "europe",
    setting: "urban",
    subject: "cars",
    latitude: 38.7164,
    longitude: -9.13333,
  },
  image_101: {
    title: "church_empty",
    locationLabel: "Lisbon, Portugal",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 38.7173,
    longitude: -9.13333,
  },
  image_102: {
    title: "bright_street",
    locationLabel: "Las Palmas de Gran Canaria, Spain",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 28.122946,
    longitude: -15.436257,
  },
  image_103: {
    title: "coronel_rocha",
    locationLabel: "Las Palmas de Gran Canaria, Spain",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 28.124446,
    longitude: -15.436257,
  },
  image_111: {
    title: "green_round",
    locationLabel: "Sintra, Portugal",
    region: "europe",
    setting: "urban",
    subject: "building",
    latitude: 38.802913,
    longitude: -9.381649,
  },
  image_112: {
    title: "twins",
    locationLabel: "Sintra, Portugal",
    region: "europe",
    setting: "nature",
    subject: "building",
    latitude: 38.803213,
    longitude: -9.381649,
  },
  image_113: {
    title: "orange",
    locationLabel: "Lisbon, Portugal",
    region: "europe",
    setting: "urban",
    subject: "cars",
    latitude: 38.7161,
    longitude: -9.13333,
  },
  image_115: {
    title: "fire",
    locationLabel: "St. Louis, MO",
    region: "north-america",
    setting: "urban",
    subject: "people",
    latitude: 38.626403,
    longitude: -90.199402,
  },
  image_116: {
    title: "motion",
    locationLabel: "St. Louis, MO",
    region: "north-america",
    setting: "urban",
    subject: "people",
    latitude: 38.627903,
    longitude: -90.199402,
  },
  image_124: {
    title: "boat_dual",
    locationLabel: "Keelung, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "random",
    latitude: 25.1286,
    longitude: 121.742,
  },
  image_125: {
    title: "lanterns",
    locationLabel: "Juifen, New Taipei, Taiwan",
    region: "asia",
    setting: "urban",
    subject: "building",
    latitude: 25.10927,
    longitude: 121.84424,
  },
  image_126: {
    title: "solitary",
    locationLabel: "Bitou, New Taipei, Taiwan",
    region: "asia",
    setting: "nature",
    subject: ["ocean", "mountains"],
    latitude: 25.128806,
    longitude: 121.923333,
  },
  image_127: {
    title: "wall",
    locationLabel: "Milford Sound, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.617,
    longitude: 167.8667,
  },
  image_128: {
    title: "wall_with_mountains",
    locationLabel: "Milford Sound, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.6161,
    longitude: 167.8667,
  },
  image_129: {
    title: "spiky",
    locationLabel: "Milford Sound, New Zealand",
    region: "oceania",
    setting: "nature",
    subject: "mountains",
    latitude: -44.6173,
    longitude: 167.8667,
  },
  image_137: {
    title: "hiace",
    locationLabel: "Las Palmas de Gran Canaria, Spain",
    region: "europe",
    setting: "urban",
    subject: "random",
    latitude: 28.122646,
    longitude: -15.436257,
  },
  image_140: {
    title: "bench",
    locationLabel: "St. Louis, MO",
    region: "north-america",
    setting: "urban",
    subject: "random",
    latitude: 38.626103,
    longitude: -90.199402,
  },
};

// Build the photo list from the highest index we know about.
// We *exclude as few as possible* while guaranteeing:
// - no blank photos (we retry common extensions on error)
// - every rendered photo has a non-placeholder location pill
const MAX_INDEX = Math.max(
  PHOTO_COUNT,
  ...Object.keys(photoOverrides).map((k) => Number(k.split("_")[1]) || 0),
);

const photos: PhotoMeta[] = Array.from({ length: MAX_INDEX }, (_, i) => {
  const index = i + 1;
  const id = `image_${index}`;
  const override = photoOverrides[id];

  // If there's no override (or it's placeholder), we don't have a location pill.
  // Exclude to satisfy "no photos without location tabs".
  const locationLabel = (override?.locationLabel as string | undefined) ?? "hold";
  if (!override || isHoldText(locationLabel)) return null;

  return {
    ...basePhoto,
    id,
    src: buildR2Src(id, EXT_CANDIDATES[0]),
    ...override,
    locationLabel,
  };
}).filter(Boolean) as PhotoMeta[];

// ---------- helpers ----------
const regionLabels: Record<Region, string> = {
  asia: "Asia",
  "north-america": "North America",
  europe: "Europe",
  oceania: "Oceania",
};

const settingLabels: Record<Setting, string> = {
  nature: "Nature",
  urban: "Urban",
};

const subjectLabels: Record<Subject, string> = {
  cars: "Cars",
  people: "People",
  mountains: "Mountains",
  ocean: "Ocean",
  building: "Building",
  forest: "Forest",
  flora: "Flora",
  random: "Random",
};

const layoutClasses: Record<LayoutVariant, string> = {
  full: "col-span-12 md:col-span-12",
  half: "col-span-12 md:col-span-6",
  window: "col-span-12",
};

// indices that become window rows (0-based)
const windowIndices = new Set<number>([5, 18, 31, 44, 57, 70, 83, 96, 109, 122]);

function computeLayoutVariant(photo: PhotoMeta, index0: number): LayoutVariant {
  if (photo.layoutVariant) return photo.layoutVariant;
  if (windowIndices.has(index0)) return "window";
  return index0 % 3 === 0 ? "full" : "half";
}

// ---------- WINDOW (scroll-tied parallax + freeze + pill timing) ----------

function WindowFrame({
  photo,
  index0,
  onImageError,
}: {
  photo: PhotoMeta;
  index0: number;
  onImageError: (id: string) => void;
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [src, setSrc] = useState(() => buildR2Src(photo.id, EXT_CANDIDATES[0]));
  const extIdxRef = useRef(0);

  useEffect(() => {
    extIdxRef.current = 0;
    setSrc(buildR2Src(photo.id, EXT_CANDIDATES[0]));
  }, [photo.id]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const topInset = useTransform(scrollYProgress, [0, 0.22], ["22%", "0%"]);
  const bottomInset = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    ["22%", "0%", "0%", "100%"],
  );
  const clipPath = useMotionTemplate`inset(${topInset} 0% ${bottomInset} 0%)`;

  const imageY = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    ["-20%", "0%", "0%", "20%"],
  );

  const pillOpacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.28, 0.60, 0.68, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const pillY = useTransform(scrollYProgress, [0.22, 0.28, 0.60, 0.68], [10, 0, 0, 10]);

  const isPriority = index0 < 14 || windowIndices.has(index0);
  const showLocation = !isHoldText(photo.locationLabel);

  return (
    <div className="col-span-12" id={`photo-${photo.id}`}>
      <div ref={sectionRef} className="relative h-[220vh] md:h-[240vh]">
        <div className="sticky top-0 h-dvh bg-black overflow-hidden">
          <motion.div
            style={{ clipPath }}
            className="absolute inset-0 will-change-[clip-path]"
          >
            <motion.div
              style={{ y: imageY, scale: 1.12 }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={src}
                alt={photo.alt}
                priority={isPriority}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                fill
                sizes={FLEX_SIZES}
                quality={80}
                className="object-cover"
                onError={() => {
                  const nextIdx = extIdxRef.current + 1;
                  if (nextIdx < EXT_CANDIDATES.length) {
                    extIdxRef.current = nextIdx;
                    setSrc(buildR2Src(photo.id, EXT_CANDIDATES[nextIdx]));
                    return;
                  }
                  onImageError(photo.id);
                }}
              />
            </motion.div>
          </motion.div>

          {showLocation && (
            <motion.div
              style={{ opacity: pillOpacity, y: pillY }}
              className="pointer-events-none absolute right-4 sm:right-6 bottom-4 sm:bottom-6"
            >
              <div className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-white/90 shadow-sm backdrop-blur-md">
                <span className="line-clamp-1">{photo.locationLabel}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- GRID CARD (faster perceived load + more elegant appear) ----------

function GridPhotoCard({
  photo,
  index0,
  onImageError,
}: {
  photo: PhotoMeta;
  index0: number;
  onImageError: (id: string) => void;
}) {
  const gridClass = layoutClasses[computeLayoutVariant(photo, index0)];
  const isPriority = index0 < 14 || windowIndices.has(index0);
  const showLocation = !isHoldText(photo.locationLabel);
  const [src, setSrc] = useState(() => buildR2Src(photo.id, EXT_CANDIDATES[0]));
  const extIdxRef = useRef(0);

  useEffect(() => {
    extIdxRef.current = 0;
    setSrc(buildR2Src(photo.id, EXT_CANDIDATES[0]));
  }, [photo.id]);

  return (
    <motion.div
      id={`photo-${photo.id}`}
      className={gridClass}
      initial={{ opacity: 0, y: 18, scale: 0.992, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.35, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <div className="w-full">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-black">
          <Image
            src={src}
            alt={photo.alt}
            priority={isPriority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            fill
            sizes={
              computeLayoutVariant(photo, index0) === "full"
                ? FLEX_SIZES
                : "(min-width:1024px) 50vw, 100vw"
            }
            quality={80}
            className="h-full w-full object-cover"
            onError={() => {
              const nextIdx = extIdxRef.current + 1;
              if (nextIdx < EXT_CANDIDATES.length) {
                extIdxRef.current = nextIdx;
                setSrc(buildR2Src(photo.id, EXT_CANDIDATES[nextIdx]));
                return;
              }
              onImageError(photo.id);
            }}
          />
          {showLocation && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end">
              <div className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-white/90 shadow-sm backdrop-blur-md">
                <span className="line-clamp-1">{photo.locationLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------- MAP panel (persistent + preloaded; fills pane) ----------

type MapPanelProps = {
  photos: PhotoMeta[];
  visible: boolean;
  onSelectPhoto: (id: string) => void;
};

function MapPanel({ photos, visible, onSelectPhoto }: MapPanelProps) {
  const visibleHostRef = useRef<HTMLDivElement | null>(null);
  const preloadHostRef = useRef<HTMLDivElement | null>(null);

  const mapRootElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => setMounted(true), []);

  const geotagged = useMemo(() => {
    return photos.filter((p) => {
      if (!isValidLatLng(p.latitude, p.longitude)) return false;
      if (p.latitude === 0 && p.longitude === 0) return false;
      return !isHoldText(p.locationLabel);
    });
  }, [photos]);

  const hasGeotags = geotagged.length > 0;

  const nudgeResize = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const kick = () => {
      try {
        map.resize();
      } catch {
        // ignore
      }
    };

    requestAnimationFrame(() => requestAnimationFrame(kick));
    setTimeout(kick, 90);
    setTimeout(kick, 220);
    setTimeout(kick, 420);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (mapRootElRef.current) return;
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.inset = "0";
    el.style.width = "100%";
    el.style.height = "100%";
    mapRootElRef.current = el;
  }, [mounted]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mod = await import("mapbox-gl");
        if (cancelled) return;

        const mapboxgl = (mod as any).default || (mod as any);
        mapboxRef.current = mapboxgl;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          setTokenMissing(true);
          return;
        }
        mapboxgl.accessToken = token;
        setTokenMissing(false);
      } catch (e) {
        console.warn("mapbox-gl failed to load", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;
    const root = mapRootElRef.current;
    if (!root) return;

    const target = visible ? visibleHostRef.current : preloadHostRef.current;
    if (!target) return;

    if (root.parentElement !== target) {
      target.appendChild(root);
    }

    nudgeResize();
  }, [mounted, visible, nudgeResize]);

  useEffect(() => {
    if (!mounted) return;
    if (tokenMissing) return;
    if (mapRef.current) return;

    const mapboxgl = mapboxRef.current;
    const root = mapRootElRef.current;
    const preloadHost = preloadHostRef.current;

    if (!mapboxgl || !root || !preloadHost) return;

    if (root.parentElement !== preloadHost) {
      preloadHost.appendChild(root);
    }

    const avgLat =
      geotagged.length > 0
        ? geotagged.reduce((s, p) => s + p.latitude, 0) / geotagged.length
        : 20;
    const avgLng =
      geotagged.length > 0
        ? geotagged.reduce((s, p) => s + p.longitude, 0) / geotagged.length
        : 0;

    const map = new mapboxgl.Map({
      container: root,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [avgLng || 0, avgLat || 20],
      zoom: geotagged.length > 1 ? 2.4 : geotagged.length === 1 ? 4 : 1.2,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showZoom: true }), "top-right");

    map.on("load", () => {
      setReady(true);
      nudgeResize();
    });

    const onWinResize = () => nudgeResize();
    window.addEventListener("resize", onWinResize);
    window.addEventListener("orientationchange", onWinResize);

    return () => {
      window.removeEventListener("resize", onWinResize);
      window.removeEventListener("orientationchange", onWinResize);
      try {
        map.remove();
      } catch {
        // ignore
      }
      mapRef.current = null;
      markersRef.current = [];
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, tokenMissing, nudgeResize]);

  useEffect(() => {
    if (!mounted) return;
    const map = mapRef.current;
    if (!map) return;

    const target = visible ? visibleHostRef.current : preloadHostRef.current;
    if (!target) return;

    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      try {
        map.resize();
      } catch {
        // ignore
      }
    });

    ro.observe(target);
    return () => ro.disconnect();
  }, [mounted, visible]);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;

    markersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch {
        // ignore
      }
    });
    markersRef.current = [];

    geotagged.forEach((photo) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className =
        "h-3.5 w-3.5 rounded-full bg-white ring-2 ring-black/70 shadow-[0_2px_10px_rgba(0,0,0,0.65)] cursor-pointer";
      el.setAttribute("aria-label", `jump to ${photo.id}`);
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        onSelectPhoto(photo.id);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([photo.longitude, photo.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    const animate = visible;
    const duration = animate ? 520 : 0;

    if (geotagged.length === 0) {
      map.easeTo({ center: [0, 20], zoom: 1.2, duration });
      nudgeResize();
      return;
    }

    if (geotagged.length === 1) {
      map.easeTo({
        center: [geotagged[0].longitude, geotagged[0].latitude],
        zoom: 4,
        duration,
      });
      nudgeResize();
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    geotagged.forEach((p) => bounds.extend([p.longitude, p.latitude]));
    map.fitBounds(bounds, {
      padding: 70,
      maxZoom: 4.6,
      duration,
    });

    nudgeResize();
  }, [geotagged, visible, onSelectPhoto, nudgeResize]);

  if (!mounted) return null;

  return (
    <>
      {createPortal(
        <div
          ref={preloadHostRef}
          aria-hidden="true"
          className="fixed -left-[9999px] -top-[9999px] h-[22rem] w-[min(780px,96vw)] overflow-hidden opacity-0 pointer-events-none"
        />,
        document.body,
      )}

      <div className="absolute inset-0">
        <div ref={visibleHostRef} className="absolute inset-0" />

        {!ready && !tokenMissing && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-neutral-900 via-neutral-800/80 to-neutral-900" />
        )}

        {tokenMissing && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-neutral-200">
            NEXT_PUBLIC_MAPBOX_TOKEN missing.
          </div>
        )}

        {!tokenMissing && !hasGeotags && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-neutral-200/90">
            add latitude / longitude to your photos to see them plotted here.
          </div>
        )}
      </div>
    </>
  );
}

// ---------- FILTERS panel (fills pane) ----------

type FilterState = {
  regions: Set<Region>;
  settings: Set<Setting>;
  subjects: Set<Subject>;
};

type FiltersPanelProps = {
  state: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
};

function FiltersPanel({ state, onChange, onReset }: FiltersPanelProps) {
  const toggle = <T extends string>(set: Set<T>, v: T) => {
    const n = new Set(set);
    n.has(v) ? n.delete(v) : n.add(v);
    return n;
  };

  const chip =
    "rounded-full px-4 py-1.5 text-[0.95rem] transition focus-visible:outline-none";

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-300/90">
          Location
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(regionLabels) as Region[]).map((r) => {
            const active = state.regions.has(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    regions: toggle(state.regions, r),
                  })
                }
                className={
                  chip +
                  " " +
                  (active
                    ? "bg-black text-white font-semibold"
                    : "bg-black/70 text-white/80 hover:bg-black")
                }
              >
                {regionLabels[r]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-300/90">
          Setting
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(settingLabels) as Setting[]).map((s) => {
            const active = state.settings.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    settings: toggle(state.settings, s),
                  })
                }
                className={
                  chip +
                  " " +
                  (active
                    ? "bg-black text-white font-semibold"
                    : "bg-black/70 text-white/80 hover:bg-black")
                }
              >
                {settingLabels[s]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-300/90">
          Subject
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(subjectLabels) as Subject[]).map((s) => {
            const active = state.subjects.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    subjects: toggle(state.subjects, s),
                  })
                }
                className={
                  chip +
                  " " +
                  (active
                    ? "bg-black text-white font-semibold"
                    : "bg-black/70 text-white/80 hover:bg-black")
                }
              >
                {subjectLabels[s]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-1 flex justify-end pb-1">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-black/80 focus-visible:outline-none"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ---------- LIQUID-GLASS PILL (fixed dock + anchored popup) ----------

type BubbleMode = "map" | "filters" | null;

type FloatingControlsProps = {
  photos: PhotoMeta[];
  filterState: FilterState;
  onFilterChange: (next: FilterState) => void;
  onSelectPhoto: (photoId: string) => void;
};

function FloatingControls({
  photos,
  filterState,
  onFilterChange,
  onSelectPhoto,
}: FloatingControlsProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BubbleMode>(null);

  const pressTimerRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [open, mounted]);

  const resetFilters = () =>
    onFilterChange({
      regions: new Set(),
      settings: new Set(),
      subjects: new Set(),
    });

  const activeFiltersCount =
    filterState.regions.size +
    filterState.settings.size +
    filterState.subjects.size;

  const panelOpen = open && mode !== null;

  const openMode = (next: BubbleMode) => {
    if (!next) return;
    setOpen(true);
    setMode(next);
  };

  const toggleMode = (next: BubbleMode) => {
    if (!next) return;
    if (open && mode === next) {
      setOpen(false);
      setMode(null);
    } else {
      setOpen(true);
      setMode(next);
    }
  };

  const startPress = (next: BubbleMode) => {
    if (!next) return;
    longPressFiredRef.current = false;

    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    pressTimerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      openMode(next);
    }, 120);
  };

  const endPress = (next: BubbleMode) => {
    if (!next) return;

    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (!longPressFiredRef.current) {
      toggleMode(next);
    }
  };

  const cancelPress = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    longPressFiredRef.current = false;
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="close overlay"
            onClick={() => {
              setOpen(false);
              setMode(null);
            }}
            className="fixed inset-0 z-[190] bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-3 z-[200] md:bottom-7 md:right-6">
        <div className="relative">
          <motion.div
            className="absolute right-0 bottom-[3.25rem] z-[10] w-[min(780px,96vw)]"
            initial="closed"
            animate={panelOpen ? "open" : "closed"}
            variants={{
              open: {
                opacity: 1,
                y: 0,
                scale: 1,
                visibility: "visible",
                transition: { duration: 0.22, ease: [0.22, 0.61, 0.36, 1] },
              },
              closed: {
                opacity: 0,
                y: 10,
                scale: 0.985,
                transition: { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] },
                transitionEnd: { visibility: "hidden" },
              },
            }}
            style={{
              pointerEvents: panelOpen ? "auto" : "none",
              transformOrigin: "100% 100%",
            }}
            aria-hidden={!panelOpen}
          >
            <div className="relative h-[22rem] w-full overflow-hidden rounded-2xl bg-neutral-900/70 backdrop-blur-2xl shadow-[0_14px_55px_rgba(0,0,0,0.62)]">
              <motion.div
                initial={false}
                animate={{
                  opacity: open && mode === "map" ? 1 : 0,
                  scale: open && mode === "map" ? 1 : 0.985,
                }}
                transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute inset-0"
                style={{
                  pointerEvents: open && mode === "map" ? "auto" : "none",
                }}
              >
                <MapPanel
                  photos={photos}
                  visible={open && mode === "map"}
                  onSelectPhoto={onSelectPhoto}
                />
              </motion.div>

              <motion.div
                initial={false}
                animate={{
                  opacity: open && mode === "filters" ? 1 : 0,
                  scale: open && mode === "filters" ? 1 : 0.985,
                }}
                transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute inset-0"
                style={{
                  pointerEvents: open && mode === "filters" ? "auto" : "none",
                }}
              >
                <FiltersPanel
                  state={filterState}
                  onChange={onFilterChange}
                  onReset={resetFilters}
                />
              </motion.div>
            </div>
          </motion.div>

          <div className="relative z-[20] flex items-center gap-2 rounded-full px-1.5 py-1">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-black/35 backdrop-blur-md shadow-[0_10px_28px_rgba(0,0,0,0.70)]"
              initial={false}
              animate={{ opacity: open ? 0 : 1 }}
              transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
            />

            <button
              type="button"
              aria-label="map"
              onPointerDown={() => startPress("map")}
              onPointerUp={() => endPress("map")}
              onPointerCancel={cancelPress}
              onPointerLeave={cancelPress}
              className={[
                "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
                "transition focus-visible:outline-none active:scale-[0.96]",
                open ? "shadow-[0_10px_28px_rgba(0,0,0,0.70)]" : "",
                open
                  ? mode === "map"
                    ? "text-white"
                    : "text-neutral-200 hover:text-white"
                  : "text-neutral-200 hover:bg-white/10",
              ].join(" ")}
            >
              <MapIcon className="h-4 w-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
            </button>

            <div className="h-5 w-px bg-white/25" />

            <button
              type="button"
              aria-label="filters"
              onPointerDown={() => startPress("filters")}
              onPointerUp={() => endPress("filters")}
              onPointerCancel={cancelPress}
              onPointerLeave={cancelPress}
              className={[
                "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
                "transition focus-visible:outline-none active:scale-[0.96]",
                open ? "shadow-[0_10px_28px_rgba(0,0,0,0.70)]" : "",
                open
                  ? mode === "filters" || activeFiltersCount > 0
                    ? "text-white"
                    : "text-neutral-200 hover:text-white"
                  : activeFiltersCount > 0
                    ? "bg-white/15 text-white"
                    : "text-neutral-200 hover:bg-white/10",
              ].join(" ")}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ---------- PAGE ----------

export default function PhotosPage() {
  const [filterState, setFilterState] = useState<FilterState>({
    regions: new Set(),
    settings: new Set(),
    subjects: new Set(),
  });

  const [brokenPhotoIds, setBrokenPhotoIds] = useState<Set<string>>(() => new Set());

  const reportBroken = useCallback((id: string) => {
    setBrokenPhotoIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos
      .filter((p) => !brokenPhotoIds.has(p.id))
      .filter((p) => {
        const regionOk =
          filterState.regions.size === 0 || filterState.regions.has(p.region);
        const settingOk =
          filterState.settings.size === 0 || filterState.settings.has(p.setting);

        const subjects = Array.isArray(p.subject) ? p.subject : [p.subject];
        const subjectOk =
          filterState.subjects.size === 0 ||
          subjects.some((s) => filterState.subjects.has(s));

        return regionOk && settingOk && subjectOk;
      });
  }, [filterState, brokenPhotoIds]);

  const handleSelectPhoto = useCallback((id: string) => {
    const el = document.getElementById(`photo-${id}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = 96;
    window.scrollTo({
      top: window.scrollY + rect.top - offset,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <Container>
        {/* match experience page scaffold so the first photo aligns with edu/about baseline */}
        <div className="-mx-4 sm:-mx-6 overflow-x-hidden">
          <div className="px-4 sm:px-6 pt-[112px] md:pt-[112px] pb-10">
            <div className="relative overflow-visible">
              <div className="grid grid-cols-12 gap-6 md:gap-10">
                {filteredPhotos.map((photo) => {
                  const index0 = getPhotoIndex0(photo.id);
                  const variant = computeLayoutVariant(photo, index0);

                  return variant === "window" ? (
                    <WindowFrame
                      key={photo.id}
                      photo={photo}
                      index0={index0}
                      onImageError={reportBroken}
                    />
                  ) : (
                    <GridPhotoCard
                      key={photo.id}
                      photo={photo}
                      index0={index0}
                      onImageError={reportBroken}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <FloatingControls
        photos={filteredPhotos}
        filterState={filterState}
        onFilterChange={setFilterState}
        onSelectPhoto={handleSelectPhoto}
      />
    </>
  );
}

