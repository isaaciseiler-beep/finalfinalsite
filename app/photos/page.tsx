// app/photos/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const photos: PhotoMeta[] = Array.from({ length: PHOTO_COUNT }, (_, i) => {
  const index = i + 1;
  const id = `image_${index}`;
  const override = photoOverrides[id] ?? {};
  return {
    ...basePhoto,
    id,
    src: `${R2_BASE_URL}/image_${index}.JPG`,
    ...override,
  };
});

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

// indices that become window rows
const windowIndices = new Set<number>([5, 18, 31, 44, 57, 70, 83, 96, 109, 122]);

function computeLayoutVariant(photo: PhotoMeta, index: number): LayoutVariant {
  if (photo.layoutVariant) return photo.layoutVariant;
  if (windowIndices.has(index)) return "window";
  return index % 3 === 0 ? "full" : "half";
}

// ---------- WINDOW (scroll-tied parallax + freeze + pill timing) ----------

function WindowFrame({ photo, index }: { photo: PhotoMeta; index: number }) {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // window borders:
  // - phase a: top+bottom retract until the photo is full-screen
  // - phase b: hold (full-screen; photo frozen; pill visible)
  // - phase c: pill disappears
  // - phase d: bottom border moves up (photo exits)
  const topInset = useTransform(scrollYProgress, [0, 0.22], ["22%", "0%"]);
  const bottomInset = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    ["22%", "0%", "0%", "100%"],
  );
  const clipPath = useMotionTemplate`inset(${topInset} 0% ${bottomInset} 0%)`;

  // parallax tied directly to scroll (no spring): photo moves slower than the page,
  // freezes during the full-screen hold, then resumes as the bottom border closes.
  const imageY = useTransform(
    scrollYProgress,
    [0, 0.22, 0.72, 1],
    ["-20%", "0%", "0%", "20%"],
  );

  // location pill: only during the full-screen hold; hides before the bottom border starts moving
  const pillOpacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.28, 0.60, 0.68, 1],
    [0, 0, 1, 1, 0, 0],
  );
  const pillY = useTransform(scrollYProgress, [0.22, 0.28, 0.60, 0.68], [10, 0, 0, 10]);

  const isPriority = index < 14 || windowIndices.has(index);

  return (
    <div className="col-span-12" id={`photo-${photo.id}`}>
      {/* no 100vw breakout: stays inside whatever main layout uses next to sidebar */}
      <div ref={sectionRef} className="relative h-[220vh] md:h-[240vh]">
        <div className="sticky top-0 h-dvh bg-black overflow-hidden">
          <motion.div
            style={{ clipPath }}
            className="absolute inset-0 will-change-[clip-path]"
          >
            <motion.div
              // scale prevents edge reveal while translating
              style={{ y: imageY, scale: 1.12 }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                priority={isPriority}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                fill
                sizes={FLEX_SIZES}
                quality={80}
                className="object-cover"
              />
            </motion.div>
          </motion.div>

          <motion.div
            style={{ opacity: pillOpacity, y: pillY }}
            className="pointer-events-none absolute right-4 sm:right-6 bottom-4 sm:bottom-6"
          >
            <div className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-white/90 shadow-sm backdrop-blur-md">
              <span className="line-clamp-1">{photo.locationLabel}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ---------- GRID CARD (faster perceived load + more elegant appear) ----------

function GridPhotoCard({ photo, index }: { photo: PhotoMeta; index: number }) {
  const gridClass = layoutClasses[computeLayoutVariant(photo, index)];
  const isPriority = index < 14 || windowIndices.has(index);

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
            src={photo.src}
            alt={photo.alt}
            priority={isPriority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            fill
            sizes={computeLayoutVariant(photo, index) === "full" ? FLEX_SIZES : "(min-width:1024px) 50vw, 100vw"}
            quality={80}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end">
            <div className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-white/90 shadow-sm backdrop-blur-md">
              <span className="line-clamp-1">{photo.locationLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- MAP panel (inside the bubble) ----------

type MapPanelProps = {
  photos: PhotoMeta[];
  active: boolean;
  onSelectPhoto: (id: string) => void;
};

function MapPanel({ photos, active, onSelectPhoto }: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [hasGeotags, setHasGeotags] = useState(false);

  useEffect(() => {
    if (!active) return;

    const geotagged = photos.filter((p) => p.latitude || p.longitude);
    setHasGeotags(geotagged.length > 0);
    if (!mapContainer.current || geotagged.length === 0) return;

    let cancelled = false;

    (async () => {
      const mod = await import("mapbox-gl");
      const mapboxgl = mod.default || (mod as any);
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        console.warn("NEXT_PUBLIC_MAPBOX_TOKEN missing");
        return;
      }
      mapboxgl.accessToken = token;

      const avgLat =
        geotagged.reduce((s, p) => s + p.latitude, 0) / geotagged.length;
      const avgLng =
        geotagged.reduce((s, p) => s + p.longitude, 0) / geotagged.length;

      if (cancelled) return;

      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [avgLng || 0, avgLat || 0],
        zoom: geotagged.length > 1 ? 2.4 : 4,
      });

      mapRef.current.addControl(
        new mapboxgl.NavigationControl({ showZoom: true }),
        "top-right",
      );

      mapRef.current.on("load", () => {
        setReady(true);
        const kick = () => mapRef.current && mapRef.current.resize();
        requestAnimationFrame(() => requestAnimationFrame(kick));
        setTimeout(kick, 150);
        setTimeout(kick, 350);
      });

      geotagged.forEach((photo) => {
        const el = document.createElement("div");
        el.className =
          "h-3 w-3 rounded-full bg-white shadow ring-2 ring-black/60 cursor-pointer";
        el.addEventListener("click", () => onSelectPhoto(photo.id));
        new mapboxgl.Marker({ element: el })
          .setLngLat([photo.longitude, photo.latitude])
          .addTo(mapRef.current);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [active, photos, onSelectPhoto]);

  return (
    <div className="relative h-[22rem] w-full overflow-hidden rounded-2xl bg-neutral-900/90">
      {hasGeotags ? (
        <>
          <div ref={mapContainer} className="absolute inset-0" />
          {!ready && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-neutral-900 via-neutral-800/80 to-neutral-900" />
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-neutral-200">
          add latitude / longitude to your photos to see them plotted here.
        </div>
      )}
    </div>
  );
}

// ---------- FILTERS panel (inside the bubble) ----------

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
    <div className="flex w-full flex-col gap-4 rounded-2xl bg-neutral-900/95 p-5">
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

      <div className="mt-1 flex justify-end">
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

// ---------- LIQUID-GLASS PILL (single anchor that expands/retracts) ----------

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

  const handleToggle = (next: BubbleMode) => {
    if (open && mode === next) {
      setOpen(false);
      setMode(null);
    } else {
      setOpen(true);
      setMode(next);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {open && (
        <button
          type="button"
          aria-label="close overlay"
          onClick={() => {
            setOpen(false);
            setMode(null);
          }}
          className="fixed inset-0 z-[90] bg-black/30"
        />
      )}

      <div className="fixed bottom-5 right-3 z-[100] md:bottom-7 md:right-6">
        <motion.div
          layout
          initial={false}
          transition={{
            layout: { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] },
          }}
          style={{ originX: 1, originY: 1 }}
          className={`pointer-events-auto bg-neutral-900/70 shadow-lg backdrop-blur-2xl ${
            open ? "p-3 rounded-3xl w-[min(780px,96vw)]" : "px-1.5 py-1 rounded-full"
          }`}
        >
          <AnimatePresence mode="wait">
            {open && mode && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                className="mb-3 pr-14 pb-14"
              >
                {mode === "map" ? (
                  <MapPanel
                    photos={photos}
                    active={mode === "map" && open}
                    onSelectPhoto={onSelectPhoto}
                  />
                ) : (
                  <FiltersPanel
                    state={filterState}
                    onChange={onFilterChange}
                    onReset={resetFilters}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-auto absolute bottom-2 right-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggle("map")}
              aria-label="map"
              className={
                "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-200 transition focus-visible:outline-none " +
                (mode === "map" && open
                  ? "bg-white/15 text-white"
                  : "hover:bg-white/10")
              }
            >
              <MapIcon className="h-4 w-4" />
            </button>
            <div className="h-5 w-px bg-white/25" />
            <button
              type="button"
              onClick={() => handleToggle("filters")}
              aria-label="filters"
              className={
                "inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-200 transition focus-visible:outline-none " +
                ((mode === "filters" && open) || activeFiltersCount > 0
                  ? "bg-white/15 text-white"
                  : "hover:bg-white/10")
              }
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
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

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const regionOk =
        filterState.regions.size === 0 || filterState.regions.has(p.region);
      const settingOk =
        filterState.settings.size === 0 ||
        filterState.settings.has(p.setting);

      const subjects = Array.isArray(p.subject) ? p.subject : [p.subject];
      const subjectOk =
        filterState.subjects.size === 0 ||
        subjects.some((s) => filterState.subjects.has(s));

      return regionOk && settingOk && subjectOk;
    });
  }, [filterState]);

  const handleSelectPhoto = (id: string) => {
    const el = document.getElementById(`photo-${id}`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offset = 96;
    window.scrollTo({
      top: window.scrollY + rect.top - offset,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* IMPORTANT: this stays inside the app’s main layout, so it flexes with sidebar */}
      <div className="w-full max-w-none overflow-x-hidden">
        <div className="px-4 sm:px-6 pt-[112px] md:pt-[112px] pb-10">
          <div className="relative overflow-visible">
            <div className="grid grid-cols-12 gap-6 md:gap-10">
              {filteredPhotos.map((photo, index) => {
                const variant = computeLayoutVariant(photo, index);
                return variant === "window" ? (
                  <WindowFrame key={photo.id} photo={photo} index={index} />
                ) : (
                  <GridPhotoCard key={photo.id} photo={photo} index={index} />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <FloatingControls
        photos={filteredPhotos}
        filterState={filterState}
        onFilterChange={setFilterState}
        onSelectPhoto={handleSelectPhoto}
      />
    </>
  );
}
