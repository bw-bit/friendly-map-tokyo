import type { AccessCard } from "../domain/accessCard";

export const sampleVenues: AccessCard[] = [
  {
    id: "shibuya-machino-shokudo",
    name: { ja: "渋谷 まちの食堂", en: "Shibuya Machino Shokudo" },
    category: { ja: "食堂", en: "Restaurant" },
    address: {
      ja: "東京都渋谷区宇田川町 12-8",
      en: "12-8 Udagawacho, Shibuya-ku, Tokyo"
    },
    location: { lat: 35.6616, lng: 139.6983 },
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=35.6616%2C139.6983",
    accessCards: {
      ja: {
        summary:
          "入口は歩道から段差がなく、約92cm幅です。テーブル席の一部は椅子を動かせます。"
      },
      en: {
        summary:
          "The entrance is step-free from the pavement and about 92 cm wide. Some table chairs can be moved."
      }
    },
    features: [
      {
        key: "wheelchair_access",
        status: "confirmed",
        detail: {
          ja: "入口から可動席まで段差のない経路あり",
          en: "Step-free route from entrance to movable seating"
        },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "現地確認メモ", en: "On-site observation" },
          observedAt: "2026-07-18T05:00:00.000Z"
        }
      },
      {
        key: "stroller_access",
        status: "confirmed",
        detail: {
          ja: "ベビーカーを畳まず入れる入口幅",
          en: "Entrance wide enough for an unfolded stroller"
        },
        evidence: {
          sourceType: "owner_submission",
          sourceLabel: { ja: "店舗回答", en: "Venue submission" },
          observedAt: "2026-07-18T05:00:00.000Z"
        }
      },
      {
        key: "step_free",
        status: "confirmed",
        detail: { ja: "入口に段差なし", en: "No step at the entrance" },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "入口写真と現地確認", en: "Entrance photo and site check" },
          observedAt: "2026-07-18T05:00:00.000Z"
        }
      },
      {
        key: "wide_entrance",
        status: "confirmed",
        detail: { ja: "入口の有効幅 約92cm", en: "Clear entrance width: approx. 92 cm" },
        evidence: {
          sourceType: "owner_submission",
          sourceLabel: { ja: "店舗による採寸", en: "Measured by venue" },
          observedAt: "2026-07-18T05:00:00.000Z"
        }
      },
      {
        key: "movable_seating",
        status: "confirmed",
        detail: {
          ja: "テーブル席の椅子を移動可能",
          en: "Chairs at table seating can be moved"
        },
        evidence: {
          sourceType: "staff_statement",
          sourceLabel: { ja: "スタッフ回答", en: "Staff statement" },
          observedAt: "2026-07-18T05:00:00.000Z"
        }
      },
      {
        key: "english_menu",
        status: "confirmed",
        detail: { ja: "英語メニューあり", en: "English menu available" },
        evidence: {
          sourceType: "public_document",
          sourceLabel: { ja: "店頭メニュー", en: "In-store menu" },
          observedAt: "2026-07-18T05:00:00.000Z"
        }
      },
      {
        key: "hearing_writing_support",
        status: "unconfirmed",
        detail: {
          ja: "筆談対応は確認中",
          en: "Written communication support is being checked"
        },
        evidence: {
          sourceType: "public_card",
          sourceLabel: { ja: "回答待ち", en: "Awaiting confirmation" },
          observedAt: "2026-07-18T05:00:00.000Z"
        }
      }
    ],
    lastReviewedAt: "2026-07-18T05:00:00.000Z"
  },
  {
    id: "asakusa-kissa-komorebi",
    name: { ja: "浅草 喫茶こもれび", en: "Asakusa Kissa Komorebi" },
    category: { ja: "カフェ", en: "Cafe" },
    address: {
      ja: "東京都台東区浅草 2-14-3",
      en: "2-14-3 Asakusa, Taito-ku, Tokyo"
    },
    location: { lat: 35.7148, lng: 139.7952 },
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=35.7148%2C139.7952",
    accessCards: {
      ja: {
        summary:
          "正面入口は約86cm幅で小さな傾斜があります。筆談ボードをレジで利用できます。"
      },
      en: {
        summary:
          "The main entrance is about 86 cm wide with a slight slope. A writing board is available at the counter."
      }
    },
    features: [
      {
        key: "wheelchair_access",
        status: "confirmed",
        detail: { ja: "正面入口から店内まで段差なし", en: "Step-free route through main entrance" },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "現地確認メモ", en: "On-site observation" },
          observedAt: "2026-07-10T03:30:00.000Z"
        }
      },
      {
        key: "stroller_access",
        status: "confirmed",
        detail: { ja: "入口付近に一時置きスペースあり", en: "Temporary stroller space near entrance" },
        evidence: {
          sourceType: "staff_statement",
          sourceLabel: { ja: "スタッフ回答", en: "Staff statement" },
          observedAt: "2026-07-10T03:30:00.000Z"
        }
      },
      {
        key: "hearing_writing_support",
        status: "confirmed",
        detail: { ja: "レジに筆談ボードあり", en: "Writing board available at counter" },
        evidence: {
          sourceType: "owner_submission",
          sourceLabel: { ja: "店舗回答と写真", en: "Venue response and photo" },
          observedAt: "2026-07-10T03:30:00.000Z"
        }
      },
      {
        key: "step_free",
        status: "confirmed",
        detail: { ja: "小さな傾斜のみ・段差なし", en: "Slight slope, no step" },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "入口写真", en: "Entrance photo" },
          observedAt: "2026-07-10T03:30:00.000Z"
        }
      },
      {
        key: "wide_entrance",
        status: "unconfirmed",
        detail: { ja: "入口幅は約86cm（再採寸予定）", en: "Entrance approx. 86 cm (remeasure pending)" },
        evidence: {
          sourceType: "public_card",
          sourceLabel: { ja: "公開カード記載", en: "Public card entry" },
          observedAt: "2026-07-10T03:30:00.000Z"
        }
      },
      {
        key: "movable_seating",
        status: "confirmed",
        detail: { ja: "中央の2卓は椅子を移動可能", en: "Chairs at two center tables can be moved" },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "店内確認", en: "Interior observation" },
          observedAt: "2026-07-10T03:30:00.000Z"
        }
      },
      {
        key: "english_menu",
        status: "unconfirmed",
        detail: { ja: "英語メニューは確認中", en: "English menu is being checked" },
        evidence: {
          sourceType: "public_card",
          sourceLabel: { ja: "回答待ち", en: "Awaiting confirmation" },
          observedAt: "2026-07-10T03:30:00.000Z"
        }
      }
    ],
    lastReviewedAt: "2026-07-10T03:30:00.000Z"
  },
  {
    id: "ueno-minna-cultural-hall",
    name: { ja: "上野 みんなの文化ホール", en: "Ueno Minna Cultural Hall" },
    category: { ja: "文化施設", en: "Cultural venue" },
    address: {
      ja: "東京都台東区上野公園 7-5",
      en: "7-5 Uenokoen, Taito-ku, Tokyo"
    },
    location: { lat: 35.7155, lng: 139.7741 },
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=35.7155%2C139.7741",
    accessCards: {
      ja: {
        summary:
          "南入口に段差のない経路があります。受付では筆談と英語の案内用紙を利用できます。"
      },
      en: {
        summary:
          "A step-free route is available at the south entrance. Written communication and English guidance sheets are available at reception."
      }
    },
    features: [
      {
        key: "wheelchair_access",
        status: "confirmed",
        detail: { ja: "南入口から客席まで段差なし", en: "Step-free route from south entrance to seating" },
        evidence: {
          sourceType: "public_document",
          sourceLabel: { ja: "施設バリアフリー案内", en: "Venue accessibility guide" },
          observedAt: "2026-07-21T01:00:00.000Z"
        }
      },
      {
        key: "stroller_access",
        status: "confirmed",
        detail: { ja: "館内エレベーター利用可", en: "Elevator available inside" },
        evidence: {
          sourceType: "public_document",
          sourceLabel: { ja: "館内案内", en: "Building guide" },
          observedAt: "2026-07-21T01:00:00.000Z"
        }
      },
      {
        key: "hearing_writing_support",
        status: "confirmed",
        detail: { ja: "受付で筆談対応あり", en: "Written communication available at reception" },
        evidence: {
          sourceType: "owner_submission",
          sourceLabel: { ja: "施設回答", en: "Venue submission" },
          observedAt: "2026-07-21T01:00:00.000Z"
        }
      },
      {
        key: "english_menu",
        status: "confirmed",
        detail: { ja: "英語の館内案内あり", en: "English building guide available" },
        evidence: {
          sourceType: "public_document",
          sourceLabel: { ja: "英語案内PDF", en: "English guide PDF" },
          observedAt: "2026-07-21T01:00:00.000Z"
        }
      },
      {
        key: "step_free",
        status: "confirmed",
        detail: { ja: "南入口は段差なし", en: "South entrance is step-free" },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "現地確認", en: "On-site observation" },
          observedAt: "2026-07-21T01:00:00.000Z"
        }
      },
      {
        key: "wide_entrance",
        status: "confirmed",
        detail: { ja: "南入口の自動ドア幅 約110cm", en: "South automatic door approx. 110 cm wide" },
        evidence: {
          sourceType: "owner_submission",
          sourceLabel: { ja: "施設による採寸", en: "Measured by venue" },
          observedAt: "2026-07-21T01:00:00.000Z"
        }
      },
      {
        key: "movable_seating",
        status: "unconfirmed",
        detail: { ja: "公演ごとの座席対応は要確認", en: "Seating arrangements vary by event" },
        evidence: {
          sourceType: "public_card",
          sourceLabel: { ja: "公演情報の確認が必要", en: "Event-specific check required" },
          observedAt: "2026-07-21T01:00:00.000Z"
        }
      }
    ],
    lastReviewedAt: "2026-07-21T01:00:00.000Z"
  },
  {
    id: "kichijoji-books-lounge",
    name: { ja: "吉祥寺 ブックラウンジ", en: "Kichijoji Books Lounge" },
    category: { ja: "書店・ラウンジ", en: "Bookshop & lounge" },
    address: {
      ja: "東京都武蔵野市吉祥寺本町 1-9-2",
      en: "1-9-2 Kichijoji Honcho, Musashino, Tokyo"
    },
    location: { lat: 35.7031, lng: 139.5797 },
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=35.7031%2C139.5797",
    accessCards: {
      ja: {
        summary:
          "駅側入口は段差がなく、自動ドアです。通路幅や可動席は混雑時に変わるため一部未確認です。"
      },
      en: {
        summary:
          "The station-side entrance is step-free with an automatic door. Aisle width and movable seating remain partly unconfirmed during busy periods."
      }
    },
    features: [
      {
        key: "wheelchair_access",
        status: "unconfirmed",
        detail: { ja: "混雑時の通路幅を確認中", en: "Aisle width during busy hours is being checked" },
        evidence: {
          sourceType: "public_card",
          sourceLabel: { ja: "追加確認中", en: "Additional check pending" },
          observedAt: "2026-07-16T08:00:00.000Z"
        }
      },
      {
        key: "stroller_access",
        status: "confirmed",
        detail: { ja: "駅側入口から段差なし", en: "Step-free from station-side entrance" },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "現地確認", en: "On-site observation" },
          observedAt: "2026-07-16T08:00:00.000Z"
        }
      },
      {
        key: "hearing_writing_support",
        status: "unconfirmed",
        detail: { ja: "筆談対応は確認中", en: "Written support is being checked" },
        evidence: {
          sourceType: "public_card",
          sourceLabel: { ja: "回答待ち", en: "Awaiting confirmation" },
          observedAt: "2026-07-16T08:00:00.000Z"
        }
      },
      {
        key: "english_menu",
        status: "confirmed",
        detail: { ja: "英語フロアガイドあり", en: "English floor guide available" },
        evidence: {
          sourceType: "public_document",
          sourceLabel: { ja: "フロアガイド", en: "Floor guide" },
          observedAt: "2026-07-16T08:00:00.000Z"
        }
      },
      {
        key: "step_free",
        status: "confirmed",
        detail: { ja: "駅側入口に段差なし", en: "No step at station-side entrance" },
        evidence: {
          sourceType: "on_site_observation",
          sourceLabel: { ja: "入口写真", en: "Entrance photo" },
          observedAt: "2026-07-16T08:00:00.000Z"
        }
      },
      {
        key: "wide_entrance",
        status: "confirmed",
        detail: { ja: "自動ドアの有効幅 約95cm", en: "Automatic door clear width approx. 95 cm" },
        evidence: {
          sourceType: "owner_submission",
          sourceLabel: { ja: "店舗回答", en: "Venue submission" },
          observedAt: "2026-07-16T08:00:00.000Z"
        }
      },
      {
        key: "movable_seating",
        status: "unconfirmed",
        detail: { ja: "混雑時の移動可否は要確認", en: "Seat movement during busy hours needs confirmation" },
        evidence: {
          sourceType: "public_card",
          sourceLabel: { ja: "追加確認中", en: "Additional check pending" },
          observedAt: "2026-07-16T08:00:00.000Z"
        }
      }
    ],
    lastReviewedAt: "2026-07-16T08:00:00.000Z"
  }
];

