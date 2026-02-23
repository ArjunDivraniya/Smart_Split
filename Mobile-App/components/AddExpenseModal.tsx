import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface AddExpenseModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export function AddExpenseModal({ isVisible, onClose }: AddExpenseModalProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme];

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
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Add Expense</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.amountContainer}>
                            <Text style={[styles.currency, { color: colors.icon }]}>₹</Text>
                            <Text style={[styles.amountText, { color: colors.violet }]}>0</Text>
                        </View>

                        <View style={[styles.placeholderInput, { backgroundColor: colors.elevated }]}>
                            <Text style={{ color: colors.tabIconDefault }}>What was it for?</Text>
                        </View>

                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.violet }]}>
                            <Text style={styles.saveButtonText}>Save Expense</Text>
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
        height: '70%',
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
        alignItems: 'center',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 40,
    },
    currency: {
        fontSize: 24,
        fontWeight: '600',
        marginTop: 10,
        marginRight: 4,
    },
    amountText: {
        fontSize: 64,
        fontWeight: '800',
        fontFamily: 'Syne',
    },
    placeholderInput: {
        width: '100%',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    saveButton: {
        width: '100%',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 'auto',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Syne',
    },
});
