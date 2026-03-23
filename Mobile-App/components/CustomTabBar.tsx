import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AddExpenseModal } from './AddExpenseModal';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];
    const [modalVisible, setModalVisible] = useState(false);

    const openAddSheet = () => {
        setModalVisible(true);
    };

    const handleAddPersonal = () => {
        setModalVisible(false);
        navigation.navigate('add');
    };

    const handleAddGroup = () => {
        setModalVisible(false);
        navigation.navigate('groups');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.elevated }]}>
            <AddExpenseModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAddPersonal={handleAddPersonal}
                onAddGroup={handleAddGroup}
            />

            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                        ? options.title
                        : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    if (route.name === 'add') {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!event.defaultPrevented) {
                            openAddSheet();
                        }
                        return;
                    }

                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                // Center Button (Add)
                if (route.name === 'add') {
                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.centerButtonContainer}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.centerButton, { backgroundColor: colors.violet, shadowColor: colors.violet }]}>
                                <Ionicons name="add" size={32} color="white" />
                            </View>
                            <Text style={[styles.label, { color: colors.tabIconDefault, marginTop: 4 }]}>Add</Text>
                        </TouchableOpacity>
                    );
                }

                const iconName = () => {
                    switch (route.name) {
                        case 'index': return isFocused ? 'home' : 'home-outline';
                        case 'groups': return isFocused ? 'people' : 'people-outline';
                        case 'friends': return isFocused ? 'person-add' : 'person-add-outline';
                        case 'analytics': return isFocused ? 'bar-chart' : 'bar-chart-outline';
                        default: return 'square';
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={styles.tabItem}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={iconName() as any}
                            size={24}
                            color={isFocused ? colors.tabIconSelected : colors.tabIconDefault}
                        />
                        <Text style={[
                            styles.label,
                            { color: isFocused ? colors.tabIconSelected : colors.tabIconDefault }
                        ]}>
                            {label as string}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 88 : 70,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        paddingTop: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -35,
    },
    centerButton: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
    },
});
