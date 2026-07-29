import {
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  Globe,
  Languages,
  Lock,
  LogOut,
  MessageCircle,
  Monitor,
  Moon,
  Shield,
  Star,
  Sun,
  User,
  X,
} from "lucide-react-native";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { languageOptions, useI18n, type LanguageCode } from "@/lib/i18n";
import { AuthMessage } from "./AuthMessage";
import { SectionCard, SectionTitle } from "./Section";
import { SettingItem } from "./SettingItem";

type SettingsSectionsProps = {
  pushEnabled: boolean;
  setPushEnabled: Dispatch<SetStateAction<boolean>>;
  promoEnabled: boolean;
  setPromoEnabled: Dispatch<SetStateAction<boolean>>;
  travelAlertsEnabled: boolean;
  setTravelAlertsEnabled: Dispatch<SetStateAction<boolean>>;
  twoFAEnabled: boolean;
  setTwoFAEnabled: Dispatch<SetStateAction<boolean>>;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  signOut: () => void;
};

type SettingsDetailId =
  | "personalInformation"
  | "paymentMethods"
  | "changePassword"
  | "manageDevices"
  | "privacySettings"
  | "helpCenter"
  | "contactSupport"
  | "faq"
  | "termsPrivacy";

type SettingsDetail = {
  title: string;
  body: string;
  rows: string[];
};

const planFaqs = [
  {
    questionKey: "plan.howEsimWorks",
    answerKey: "plan.howEsimWorksAnswer",
  },
  {
    questionKey: "plan.activationStart",
    answerKey: "plan.activationStartAnswer",
  },
  {
    questionKey: "plan.useHotspot",
    answerKey: "plan.useHotspotAnswer",
  },
  {
    questionKey: "plan.deviceCompatible",
    answerKey: "plan.deviceCompatibleAnswer",
  },
];

export function SettingsSections(props: SettingsSectionsProps) {
  const { t } = useI18n();
  const [detailId, setDetailId] = useState<SettingsDetailId | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const detail =
    detailId && detailId !== "faq" ? getSettingsDetail(detailId, t) : null;
  const closeDetail = () => {
    setDetailId(null);
    setExpandedFaq(null);
  };

  return (
    <>
      <AccountSettings {...props} openDetail={setDetailId} />
      <PreferenceSettings {...props} />
      <SecuritySettings {...props} openDetail={setDetailId} />
      <SupportSettings openDetail={setDetailId} />
      <AccountActions error={props.error} signOut={props.signOut} />
      <SettingsFaqModal
        visible={detailId === "faq"}
        expandedFaq={expandedFaq}
        setExpandedFaq={setExpandedFaq}
        onClose={closeDetail}
      />
      <SettingsDetailModal detail={detail} onClose={closeDetail} />
    </>
  );
}

function AccountSettings({
  pushEnabled,
  setPushEnabled,
  promoEnabled,
  setPromoEnabled,
  travelAlertsEnabled,
  setTravelAlertsEnabled,
  openDetail,
}: SettingsSectionsProps & {
  openDetail: (id: SettingsDetailId) => void;
}) {
  const { t } = useI18n();

  return (
    <View className="mt-5">
      <SectionCard title={t("profile.account")}>
        <SettingItem
          item={{
            icon: User,
            label: t("profile.personalInformation"),
            sub: t("profile.personalInformationSub"),
          }}
          onPress={() => openDetail("personalInformation")}
        />
        <SettingItem
          item={{
            icon: CreditCard,
            label: t("profile.paymentMethods"),
            sub: t("profile.paymentMethodsSub"),
          }}
          onPress={() => openDetail("paymentMethods")}
        />
        <SettingItem
          item={{
            icon: Bell,
            label: t("profile.pushNotifications"),
            sub: t("profile.pushNotificationsSub"),
            toggle: true,
            toggled: pushEnabled,
          }}
          onPress={() => setPushEnabled((v) => !v)}
        />
        <SettingItem
          item={{
            icon: Star,
            label: t("profile.promotions"),
            sub: t("profile.promotionsSub"),
            toggle: true,
            toggled: promoEnabled,
          }}
          onPress={() => setPromoEnabled((v) => !v)}
        />
        <SettingItem
          item={{
            icon: Globe,
            label: t("profile.travelAlerts"),
            sub: t("profile.travelAlertsSub"),
            toggle: true,
            toggled: travelAlertsEnabled,
          }}
          onPress={() => setTravelAlertsEnabled((v) => !v)}
        />
      </SectionCard>
    </View>
  );
}

function getOptionLabel(code: LanguageCode, currentLanguage: LanguageCode) {
  if (currentLanguage === "vi") {
    return code === "en" ? "Tiếng Anh" : "Tiếng Việt";
  }

  return code === "en" ? "English" : "Vietnamese";
}

function PreferenceSettings({ darkMode, setDarkMode }: SettingsSectionsProps) {
  const { language, setLanguage, t } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);
  const languageLabel = getOptionLabel(language, language);

  return (
    <View className="mt-5">
      <SectionCard title={t("profile.preferences")}>
        <SettingItem
          item={{
            icon: darkMode ? Moon : Sun,
            label: t("profile.appearance"),
            sub: darkMode ? t("profile.darkMode") : t("profile.lightMode"),
            toggle: true,
            toggled: darkMode,
          }}
          onPress={() => setDarkMode((v) => !v)}
        />

        <SettingItem
          item={{
            icon: Languages,
            label: t("profile.languageRegion"),
            sub: languageLabel,
            accessibilityLabel: t("profile.languageRegionA11y"),
          }}
          onPress={() => setModalVisible(true)}
        />
      </SectionCard>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setModalVisible(false)}
        >
          <Pressable className="rounded-t-3xl bg-white p-5" onPress={() => {}}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-950">
                {t("profile.languageRegion")}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("common.back")}
                onPress={() => setModalVisible(false)}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={18} color="#4B5563" />
              </Pressable>
            </View>

            {languageOptions.map((option) => {
              const selected = option.code === language;

              return (
                <Pressable
                  key={option.code}
                  accessibilityRole="button"
                  onPress={() => {
                    setLanguage(option.code);
                    setModalVisible(false);
                  }}
                  className={`mb-3 flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                    selected
                      ? "border-[#6915E0] bg-[#F5F0FF]"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selected ? "text-[#6915E0]" : "text-gray-950"
                    }`}
                  >
                    {getOptionLabel(option.code, language)}
                  </Text>
                  {selected ? <Check size={20} color="#6915E0" /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SecuritySettings({
  twoFAEnabled,
  setTwoFAEnabled,
  openDetail,
}: SettingsSectionsProps & {
  openDetail: (id: SettingsDetailId) => void;
}) {
  const { t } = useI18n();

  return (
    <View className="mt-5">
      <SectionCard title={t("profile.security")}>
        <SettingItem
          item={{
            icon: Lock,
            label: t("profile.changePassword"),
            sub: t("profile.changePasswordSub"),
          }}
          onPress={() => openDetail("changePassword")}
        />

        <SettingItem
          item={{
            icon: Shield,
            label: t("profile.twoFactor"),
            sub: t("profile.twoFactorSub"),
            toggle: true,
            toggled: twoFAEnabled,
          }}
          onPress={() => setTwoFAEnabled((v) => !v)}
        />

        <SettingItem
          item={{
            icon: Monitor,
            label: t("profile.manageDevices"),
            sub: t("profile.manageDevicesSub"),
          }}
          onPress={() => openDetail("manageDevices")}
        />

        <SettingItem
          item={{
            icon: FileText,
            label: t("profile.privacySettings"),
            sub: t("profile.privacySettingsSub"),
          }}
          onPress={() => openDetail("privacySettings")}
        />
      </SectionCard>
    </View>
  );
}

function SupportSettings({
  openDetail,
}: {
  openDetail: (id: SettingsDetailId) => void;
}) {
  const { t } = useI18n();

  return (
    <View className="mt-5">
      <SectionCard title={t("profile.support")}>
        {/* <SettingItem
          item={{
            icon: HelpCircle,
            label: t("profile.helpCenter"),
            sub: t("profile.helpCenterSub"),
          }}
          onPress={() => openDetail("helpCenter")}
        /> */}

        <SettingItem
          item={{
            icon: MessageCircle,
            label: t("profile.contactSupport"),
            sub: t("profile.contactSupportSub"),
          }}
          onPress={() => openDetail("contactSupport")}
        />

        <SettingItem
          item={{
            icon: BookOpen,
            label: t("profile.faq"),
            sub: t("profile.faqSub"),
          }}
          onPress={() => openDetail("faq")}
        />

        <SettingItem
          item={{
            icon: FileText,
            label: t("profile.termsPrivacy"),
            sub: t("profile.termsPrivacySub"),
          }}
          onPress={() => openDetail("termsPrivacy")}
        />
      </SectionCard>
    </View>
  );
}

function getSettingsDetail(
  id: Exclude<SettingsDetailId, "faq">,
  t: (key: string) => string,
): SettingsDetail {
  return {
    title: t(`profile.detail.${id}.title`),
    body: t(`profile.detail.${id}.body`),
    rows: [1, 2, 3].map((index) => t(`profile.detail.${id}.row${index}`)),
  };
}

function SettingsFaqModal({
  visible,
  expandedFaq,
  setExpandedFaq,
  onClose,
}: {
  visible: boolean;
  expandedFaq: number | null;
  setExpandedFaq: Dispatch<SetStateAction<number | null>>;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-white p-5" onPress={() => {}}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-950">
              {t("plan.faq")}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
              onPress={onClose}
              className="rounded-full bg-gray-100 p-2"
            >
              <X size={18} color="#4B5563" />
            </Pressable>
          </View>

          <View className="overflow-hidden rounded-2xl border border-[#F3F4F6] bg-white">
            {planFaqs.map((faq, index) => (
              <View key={faq.questionKey}>
                {index > 0 && <View className="h-px bg-[#F3F4F6]" />}

                <Pressable
                  onPress={() =>
                    setExpandedFaq((current) =>
                      current === index ? null : index,
                    )
                  }
                  className="flex-row items-center justify-between px-5 py-4"
                >
                  <Text className="flex-1 pr-4 font-medium text-[#111827]">
                    {t(faq.questionKey)}
                  </Text>

                  {expandedFaq === index ? (
                    <ChevronUp size={20} color="#9CA3AF" />
                  ) : (
                    <ChevronDown size={20} color="#9CA3AF" />
                  )}
                </Pressable>

                {expandedFaq === index && (
                  <View className="px-5 pb-4">
                    <Text className="text-sm leading-5 text-[#4B5563]">
                      {t(faq.answerKey)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SettingsDetailModal({
  detail,
  onClose,
}: {
  detail: SettingsDetail | null;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <Modal
      visible={!!detail}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable className="rounded-t-3xl bg-white p-5" onPress={() => {}}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-950">
              {detail?.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.back")}
              onPress={onClose}
              className="rounded-full bg-gray-100 p-2"
            >
              <X size={18} color="#4B5563" />
            </Pressable>
          </View>

          <Text className="mb-4 text-sm leading-6 text-gray-600">
            {detail?.body}
          </Text>

          {detail?.rows.map((row) => (
            <View
              key={row}
              className="mb-3 flex-row rounded-2xl bg-gray-50 px-4 py-3"
            >
              <Check size={16} color="#6915E0" />
              <Text className="ml-3 flex-1 text-sm leading-5 text-gray-700">
                {row}
              </Text>
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AccountActions({
  error,
  signOut,
}: {
  error: string | null;
  signOut: () => void;
}) {
  const { t } = useI18n();

  return (
    <View className="mt-5">
      <SectionTitle title={t("profile.accountActions")} />

      <View className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
        <SettingItem
          item={{
            icon: LogOut,
            label: t("profile.signOut"),
            sub: t("profile.signOutSub"),
          }}
          onPress={signOut}
        />
      </View>

      {!!error && <AuthMessage message={error} />}

      <Text className="text-center text-xs text-gray-400 mt-4 mb-6">
        {t("profile.footer")}
      </Text>
    </View>
  );
}
