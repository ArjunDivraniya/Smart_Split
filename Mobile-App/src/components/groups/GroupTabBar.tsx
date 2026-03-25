import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type TabType = 'expenses' | 'balances' | 'timeline' | 'summary';

interface GroupTabBarProps {
  tabs: TabType[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  colors: any;
}

export const GroupTabBar: React.FC<GroupTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  colors,
}) => {
  return (
    <View style={[styles.tabsStickyWrap, { backgroundColor: colors.background, borderBottomColor: colors.elevated }]}>
      <View style={[styles.tabBar, { borderBottomColor: colors.elevated }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                borderBottomColor: activeTab === tab ? colors.violet : 'transparent',
              },
            ]}
            onPress={() => onTabChange(tab)}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab ? colors.violet : colors.icon,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsStickyWrap: {
    zIndex: 20,
    elevation: 6,
    borderBottomWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    textAlign: 'center',
  },
});
