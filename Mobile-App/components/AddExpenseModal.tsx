import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface AddExpenseModalProps {
    isVisible: boolean;
    onClose: () => void;
    onAddPersonal: () => void;
    onAddGroup: () => void;
}

export function AddExpenseModal({ isVisible, onClose, onAddPersonal, onAddGroup }: AddExpenseModalProps) {
    const colors = Colors.dark; // Forced dark theme for premium look

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <Pressable style={styles.backdrop} onPress={onClose}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
                </Pressable>

                <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Expense Type</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>What do you want to add?</Text>

                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: colors.elevated, borderColor: `${colors.violet}44` }]}
                            onPress={onAddPersonal}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.optionIconWrap, { backgroundColor: `${colors.violet}22` }]}>
                                <Ionicons name="wallet-outline" size={22} color={colors.violet} />
                            </View>
                            <View style={styles.optionTextWrap}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>Add Personal Expense</Text>
                                <Text style={[styles.optionDescription, { color: colors.icon }]}>Track your own spending quickly</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionCard, { backgroundColor: colors.elevated, borderColor: `${colors.mint}44` }]}
                            onPress={onAddGroup}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.optionIconWrap, { backgroundColor: `${colors.mint}22` }]}>
                                <Ionicons name="people-outline" size={22} color={colors.mint} />
                            </View>
                            <View style={styles.optionTextWrap}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>Add Group Expense</Text>
                                <Text style={[styles.optionDescription, { color: colors.icon }]}>Split expense with your group members</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalView: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        height: '42%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        fontFamily: 'Syne',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        gap: 14,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        marginBottom: 4,
    },
    optionCard: {
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTextWrap: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontFamily: 'DMSans_700Bold',
    },
    optionDescription: {
        fontSize: 12,
        fontFamily: 'DMSans_400Regular',
        marginTop: 2,
    },
});
