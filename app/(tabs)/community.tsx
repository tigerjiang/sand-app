import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import DeviceHeader from "../../components/DeviceHeader";
import { useI18n } from "../../contexts/I18nContext";
import { Pattern, usePlaylist } from "../../contexts/PlaylistContext";
import { useTheme } from "../../contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 两列布局，减去padding和gap

// 所有可用的SVG图案文件
const allPatterns: Pattern[] = [
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

export default function CommunityTab() {
  const { t } = useI18n();
  const { isDark } = useTheme();
  const { addToFavorite, removeFromFavorite, isFavorite, addToMyPattern } = usePlaylist();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const addMenuPosition = useRef({ x: 0, y: 0 });

  const backgroundColor = isDark ? "#000000" : "#F5F5F0";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const iconColor = isDark ? "#FFFFFF" : "#000000";
  const borderColor = isDark ? "#2C2C2E" : "#E0E0E0";
  const cardBgColor = isDark ? "#1C1C1E" : "#FFFFFF";
  const searchBgColor = isDark ? "#1C1C1E" : "#FFFFFF";
  const placeholderColor = isDark ? "#666" : "#999";
  const inactiveTextColor = isDark ? "#999" : "#999";
  const secondaryTextColor = isDark ? "#999" : "#666666";
  const menuBgColor = isDark ? "#2C2C2E" : "#FFFFFF";

  // 筛选图案 - 使用所有图案
  const filteredPatterns = allPatterns.filter((pattern) =>
    pattern.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 处理收藏
  const handleFavorite = (pattern: Pattern) => {
    if (isFavorite(pattern.id)) {
      removeFromFavorite(pattern.id);
    } else {
      addToFavorite(pattern);
    }
  };

  // 处理添加菜单
  const handleAddPress = (pattern: Pattern, event: any) => {
    setSelectedPattern(pattern);
    // 获取点击位置，菜单在左侧弹出
    event.persist();
    if (event && event.nativeEvent) {
      const { pageX, pageY } = event.nativeEvent;
      addMenuPosition.current = { x: Math.max(20, pageX - 180), y: pageY - 80 };
    } else {
      addMenuPosition.current = { x: 20, y: 200 };
    }
    setAddMenuVisible(true);
  };

  // 添加到 Playlist（实际上是当前音乐的 playlist）
  const handleAddToPlaylist = () => {
    // 这里可以添加逻辑，将图案添加到当前选中的音乐 playlist
    // 暂时不做处理，因为 playlist 是基于音乐的
    setAddMenuVisible(false);
  };

  // 添加到 My Pattern
  const handleAddToMyPattern = () => {
    if (selectedPattern) {
      addToMyPattern(selectedPattern);
    }
    setAddMenuVisible(false);
  };

  // 渲染图案卡片
  const renderPatternCard = ({ item }: { item: Pattern }) => {
    // 模拟作者信息（实际应该从数据中获取）
    const authorName = "Otávio Bitencourt";
    const authorAvatar = "cc";

    return (
      <View style={[styles.patternCard, { backgroundColor: cardBgColor }]}>
        {/* 图案SVG区域 */}
        <View style={styles.patternCardSvg}>
          <Svg width={CARD_WIDTH - 40} height={CARD_WIDTH - 80} viewBox="0 0 1000 1000">
            <Path
              d={svgPaths[item.svgFile] || svgPaths["01_complex_mandala_rings.svg"]}
              fill="none"
              stroke={iconColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        
        {/* 心形按钮 */}
        <TouchableOpacity
          style={styles.patternHeartButton}
          onPress={() => handleFavorite(item)}
        >
          <Ionicons
            name={isFavorite(item.id) ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite(item.id) ? "#FF3B30" : iconColor}
          />
        </TouchableOpacity>

        {/* 底部信息区域 */}
        <View style={styles.patternCardInfo}>
          {/* 左侧头像 */}
          <View style={styles.patternCardAvatarContainer}>
            <View style={[styles.patternCardAvatar, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }]}>
              <Text style={[styles.patternCardAvatarText, { color: textColor }]}>{authorAvatar}</Text>
            </View>
          </View>
          
          {/* 中间文字信息 */}
          <View style={styles.patternCardTextContainer}>
            <Text style={[styles.patternCardTitle, { color: textColor }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.patternCardAuthor, { color: secondaryTextColor }]} numberOfLines={1}>
              {authorName}
            </Text>
          </View>

          {/* 右侧加号按钮 */}
          <TouchableOpacity
            style={[styles.patternAddButton, { borderColor: borderColor }]}
            onPress={(e) => handleAddPress(item, e)}
          >
            <Ionicons name="add" size={16} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 列表头部组件（搜索栏和排序选项）
  const ListHeaderComponent = () => (
    <View style={styles.headerContent}>
      {/* 搜索栏和筛选 */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: searchBgColor }]}>
          <Ionicons name="search" size={20} color={placeholderColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder={t("search")}
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: searchBgColor }]}>
          <Ionicons name="options" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* 排序选项 */}
      <Text style={[styles.sortText, { color: inactiveTextColor }]}>{t("newestFirst")} • {t("all")}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <DeviceHeader />
      <FlatList
        data={filteredPatterns}
        renderItem={renderPatternCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.patternRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.contentContainer}
        style={styles.scrollView}
      />

      {/* 添加菜单模态框 */}
      <Modal
        visible={addMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddMenuVisible(false)}
        >
          <View
            style={[
              styles.addMenu,
              {
                left: addMenuPosition.current.x,
                top: Math.max(100, addMenuPosition.current.y),
                backgroundColor: menuBgColor,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={handleAddToPlaylist}
            >
              <Ionicons name="musical-notes" size={20} color={iconColor} />
              <Text style={[styles.addMenuItemText, { color: textColor }]}>{t("addToPlaylist")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={handleAddToMyPattern}
            >
              <Ionicons name="grid" size={20} color={iconColor} />
              <Text style={[styles.addMenuItemText, { color: textColor }]}>{t("addToMyPattern")}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sortText: {
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  patternRow: {
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  patternCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 12,
    position: "relative",
    overflow: "hidden",
  },
  patternCardSvg: {
    width: "100%",
    height: CARD_WIDTH - 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  patternHeartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  patternCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
  },
  patternAddButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  patternCardAvatarContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  patternCardAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  patternCardAvatarText: {
    fontSize: 10,
    fontWeight: "500",
  },
  patternCardTextContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  patternCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  patternCardAuthor: {
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  addMenu: {
    position: "absolute",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  addMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  addMenuItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
