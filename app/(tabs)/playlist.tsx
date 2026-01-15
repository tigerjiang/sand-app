import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import DeviceHeader from "../../components/DeviceHeader";
import { useI18n } from "../../contexts/I18nContext";
import { usePlaylist } from "../../contexts/PlaylistContext";
import { useTheme } from "../../contexts/ThemeContext";

// 音乐列表
const musicList = [
  "Rain Sounds",
  "Ocean Waves",
  "Forest Ambience",
  "Thunderstorm",
  "Birds Chirping",
  "Wind Through Trees",
  "Crackling Fire",
  "Waterfall",
  "City Rain",
  "Mountain Stream",
  "Desert Wind",
  "Night Crickets",
  "Coffee Shop",
  "Library Ambience",
  "Train Journey",
];

// 所有可用的SVG图案文件
const allPatterns = [
  { id: "01", svgFile: "01_complex_mandala_rings.svg", title: "Complex Mandala Rings" },
  { id: "02", svgFile: "02_islamic_star_pattern.svg", title: "Islamic Star Pattern" },
  { id: "03", svgFile: "03_double_spiral_continuous.svg", title: "Double Spiral Continuous" },
  { id: "04", svgFile: "04_dragon_curve.svg", title: "Dragon Curve" },
  { id: "05", svgFile: "05_lotus_mandala_complex.svg", title: "Lotus Mandala Complex" },
  { id: "06", svgFile: "06_zen_infinity.svg", title: "Zen Infinity" },
  { id: "07", svgFile: "07_archimedean_spiral.svg", title: "Archimedean Spiral" },
  { id: "08", svgFile: "08_lemniscate.svg", title: "Lemniscate" },
  { id: "09", svgFile: "09_cardioid.svg", title: "Cardioid" },
  { id: "10", svgFile: "10_hypotrochoid_star.svg", title: "Hypotrochoid Star" },
  { id: "11", svgFile: "11_epicycloid_flower.svg", title: "Epicycloid Flower" },
  { id: "12", svgFile: "12_superellipse.svg", title: "Superellipse" },
  { id: "13", svgFile: "13_mandala_petal.svg", title: "Mandala Petal" },
  { id: "14", svgFile: "14_mandala_inner.svg", title: "Mandala Inner" },
  { id: "15", svgFile: "15_yinyang_line.svg", title: "Yinyang Line" },
  { id: "16", svgFile: "16_labyrinth_spiral.svg", title: "Labyrinth Spiral" },
  { id: "17", svgFile: "17_sine_layer_1.svg", title: "Sine Layer 1" },
  { id: "18", svgFile: "18_sine_layer_2.svg", title: "Sine Layer 2" },
  { id: "19", svgFile: "19_sine_layer_3.svg", title: "Sine Layer 3" },
  { id: "20", svgFile: "20_sine_layer_4.svg", title: "Sine Layer 4" },
  { id: "21", svgFile: "21_sine_layer_5.svg", title: "Sine Layer 5" },
  { id: "22", svgFile: "22_sine_layer_6.svg", title: "Sine Layer 6" },
  { id: "23", svgFile: "23_sine_layer_7.svg", title: "Sine Layer 7" },
  { id: "24", svgFile: "24_wobble_spiral.svg", title: "Wobble Spiral" },
];

// 为每个音乐生成10个图案
const generateMusicPlaylists = () => {
  return musicList.map((music, index) => {
    const startIndex = (index * 10) % allPatterns.length;
    const patterns = [];
    for (let i = 0; i < 10; i++) {
      patterns.push(allPatterns[(startIndex + i) % allPatterns.length]);
    }
    return {
      musicName: music,
      patterns: patterns,
    };
  });
};

const musicPlaylists = generateMusicPlaylists();

// SVG 路径数据
const svgPaths: Record<string, string> = {
  "01_complex_mandala_rings.svg": "M500 160 C650 220 760 360 760 500 C760 640 650 780 500 840 C350 780 240 640 240 500 C240 360 350 220 500 160 C620 260 620 740 500 840 C380 740 380 260 500 160",
  "02_islamic_star_pattern.svg": "M500 150 L610 390 L870 390 L650 550 L740 820 L500 660 L260 820 L350 550 L130 390 L390 390 Z",
  "03_double_spiral_continuous.svg": "M500 500 C600 450 650 550 550 600 C450 650 350 550 450 450 C600 300 800 500 600 700 C400 900 100 600 300 400",
  "04_dragon_curve.svg": "M200 600 C260 480 340 520 380 460 C420 400 520 420 560 360 C600 300 700 340 740 300 C780 260 820 300 840 340 C780 380 760 440 700 460 C640 480 600 560 540 580 C480 600 420 680 340 660 C280 640 240 620 200 600",
  "05_lotus_mandala_complex.svg": "M500 300 C560 260 640 300 660 360 C620 380 580 420 500 460 C420 420 380 380 340 360 C360 300 440 260 500 300 C580 360 580 540 500 620 C420 540 420 360 500 300",
  "06_zen_infinity.svg": "M200 500 C200 400 300 350 400 400 C500 450 600 400 700 450 C800 500 800 600 700 550 C600 500 500 550 400 500 C300 450 200 500 200 600",
  "07_archimedean_spiral.svg": "M500 500 C550 450 600 500 550 550 C500 600 450 550 500 500 C550 450 600 500 550 550",
  "08_lemniscate.svg": "M300 500 C400 400 600 400 700 500 C600 600 400 600 300 500",
  "09_cardioid.svg": "M500 400 C550 450 600 500 550 550 C500 600 450 550 500 500",
  "10_hypotrochoid_star.svg": "M500 300 L600 400 L700 300 L600 500 L500 700 L400 500 L300 300 L400 400 Z",
  "11_epicycloid_flower.svg": "M500 350 C550 400 600 450 550 500 C500 550 450 500 500 450",
  "12_superellipse.svg": "M400 400 L600 400 L600 600 L400 600 Z",
  "13_mandala_petal.svg": "M500 300 C530 330 550 360 530 390 C500 420 470 390 500 360",
  "14_mandala_inner.svg": "M500 400 C520 420 540 440 520 460 C500 480 480 460 500 440",
  "15_yinyang_line.svg": "M300 500 C400 500 500 400 500 300 C500 200 400 200 300 300",
  "16_labyrinth_spiral.svg": "M500 500 C550 450 600 500 650 550 C600 600 550 650 500 600",
  "17_sine_layer_1.svg": "M200 500 C300 450 400 500 500 550 C400 600 300 550 200 500",
  "18_sine_layer_2.svg": "M200 500 C300 480 400 520 500 540 C400 560 300 520 200 500",
  "19_sine_layer_3.svg": "M200 500 C300 470 400 530 500 550 C400 570 300 530 200 500",
  "20_sine_layer_4.svg": "M200 500 C300 460 400 540 500 560 C400 580 300 540 200 500",
  "21_sine_layer_5.svg": "M200 500 C300 450 400 550 500 570 C400 590 300 550 200 500",
  "22_sine_layer_6.svg": "M200 500 C300 440 400 560 500 580 C400 600 300 560 200 500",
  "23_sine_layer_7.svg": "M200 500 C300 430 400 570 500 590 C400 610 300 570 200 500",
  "24_wobble_spiral.svg": "M500 500 C550 450 600 500 650 550 C700 600 650 650 600 600",
};

type TabType = "playlist" | "my-pattern" | "my-favorite";

export default function PlaylistTab() {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const { myFavorite, myPattern } = usePlaylist();
  const [selectedMusicIndex, setSelectedMusicIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("playlist");
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const selectedColor = "#9370DB";
  const borderColor = isDark ? "#2C2C2E" : "#E0E0E0";
  const inactiveTextColor = isDark ? "#999" : "#999";
  const activeBgColor = isDark ? "#2C2C2E" : "#E8E8E8";
  const paginationDotColor = isDark ? "#666" : "#D0D0D0";
  const paginationDotActiveColor = isDark ? "#999" : "#666";

  const selectedMusic = musicPlaylists[selectedMusicIndex];
  const currentPatterns = selectedMusic?.patterns || [];

  // 根据tab获取要显示的列表
  const getDisplayPatterns = () => {
    if (activeTab === "playlist") {
      return currentPatterns;
    } else if (activeTab === "my-pattern") {
      // 我的图案 - 从 Context 获取
      return myPattern;
    } else {
      // 我的收藏 - 从 Context 获取
      return myFavorite;
    }
  };

  const displayPatterns = getDisplayPatterns();

  const handleMusicSelect = (index: number) => {
    setSelectedMusicIndex(index);
    setCurrentPatternIndex(0);
  };

  const handlePatternSelect = (index: number) => {
    setCurrentPatternIndex(index);
  };

  const renderMusicCard = ({ item, index }: { item: typeof musicPlaylists[0]; index: number }) => {
    // 根据索引决定背景色，偶数索引为深色，奇数索引为浅色
    const baseBgColor = index % 2 === 0 
      ? (isDark ? "#2C2C2E" : "#E8E8E8")
      : (isDark ? "#1C1C1E" : "#FFFFFF");
    const cardBgColor = baseBgColor;
    const cardTextColor = isDark 
      ? (baseBgColor === "#2C2C2E" ? "#FFFFFF" : "#FFFFFF")
      : (baseBgColor === "#E8E8E8" ? "#000000" : "#000000");
    const playIconColor = isDark ? "#FFFFFF" : "#000000";

    return (
      <TouchableOpacity
        style={[styles.musicCard, { backgroundColor: cardBgColor }]}
        onPress={() => handleMusicSelect(index)}
        activeOpacity={0.8}
      >
        <Text style={[styles.musicCardTitle, { color: cardTextColor }]}>{item.musicName}</Text>
        <Text style={[styles.musicCardTracks, { color: cardTextColor }]}>{item.patterns.length} TRACKS</Text>
        <View style={[styles.musicCardPlayIcon, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)" }]}>
          <Ionicons name="play" size={16} color={playIconColor} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <DeviceHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 上半部分：音乐卡片滑动列表 */}
        <View style={styles.topSection}>
          <FlatList
            data={musicPlaylists}
            renderItem={renderMusicCard}
            keyExtractor={(item, index) => `music-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled={false}
            snapToInterval={280 + 16}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.musicCardContainer}
            onScrollToIndexFailed={() => {}}
            onMomentumScrollEnd={(event) => {
              const contentOffsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(contentOffsetX / (280 + 16));
              if (index >= 0 && index < musicPlaylists.length && index !== selectedMusicIndex) {
                setSelectedMusicIndex(index);
              }
            }}
          />
          {/* 分页指示器 */}
          <View style={styles.paginationDots}>
            {musicPlaylists.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    backgroundColor: index === selectedMusicIndex ? paginationDotActiveColor : paginationDotColor,
                  },
                  index === selectedMusicIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 下半部分：Tab和列表 */}
        <View style={styles.bottomSection}>
          {/* Tab切换 */}
          <View style={[styles.tabContainer, { borderBottomColor: borderColor }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "playlist" && styles.tabActive]}
              onPress={() => setActiveTab("playlist")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "playlist" && styles.tabTextActive,
                  { color: activeTab === "playlist" ? textColor : inactiveTextColor },
                ]}
              >
                {t("playlist")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "my-pattern" && styles.tabActive]}
              onPress={() => setActiveTab("my-pattern")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "my-pattern" && styles.tabTextActive,
                  { color: activeTab === "my-pattern" ? textColor : "#999" },
                ]}
              >
                {t("myPattern")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "my-favorite" && styles.tabActive]}
              onPress={() => setActiveTab("my-favorite")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "my-favorite" && styles.tabTextActive,
                  { color: activeTab === "my-favorite" ? textColor : "#999" },
                ]}
              >
                {t("myFavorite")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 图案列表 */}
          <View style={styles.patternListContainer}>
            {displayPatterns.length > 0 ? (
              displayPatterns.map((pattern, index) => {
                // 只有 playlist tab 才需要高亮当前选中的图案
                const isActive = activeTab === "playlist" && currentPatterns.findIndex((p) => p.id === pattern.id) === currentPatternIndex;

                return (
                  <TouchableOpacity
                    key={pattern.id}
                    style={[
                      styles.patternItem,
                      isActive && { backgroundColor: activeBgColor },
                    ]}
                    onPress={() => {
                      if (activeTab === "playlist") {
                        const globalIndex = currentPatterns.findIndex((p) => p.id === pattern.id);
                        handlePatternSelect(globalIndex);
                      }
                    }}
                  >
                    <View style={styles.patternItemIcon}>
                      <Svg width={128} height={128} viewBox="0 0 1000 1000">
                        <Path
                          d={svgPaths[pattern.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
                          fill="none"
                          stroke={iconColor}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <Text
                      style={[
                        styles.patternItemText,
                        { color: isActive ? selectedColor : textColor },
                      ]}
                    >
                      {pattern.title}
                    </Text>
                    {isActive && (
                      <Ionicons name="play-circle" size={20} color={selectedColor} />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: inactiveTextColor }]}>{t("noPatternsAvailable")}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  topSection: {
    marginBottom: 30,
  },
  musicCardContainer: {
    paddingRight: 20,
    gap: 16,
  },
  musicCard: {
    width: 280,
    height: 160,
    borderRadius: 16,
    padding: 20,
    justifyContent: "space-between",
    marginRight: 16,
  },
  musicCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  musicCardTracks: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
  musicCardPlayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#9370DB",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    fontWeight: "600",
  },
  patternListContainer: {
    flex: 1,
  },
  patternItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  patternItemActive: {
    // Will be set dynamically
  },
  patternItemIcon: {
    width: 128,
    height: 128,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  patternItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
