import React, { useMemo, useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createSettlement } from '@/src/services/settlements.service';
import { hapticImpactHeavy, hapticNotifySuccess } from '@/src/utils/haptics';
import { showSuccessToast } from '@/src/utils/toast';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

const PAYMENT_METHODS: Array<'upi' | 'cash' | 'bank'> = ['upi', 'cash', 'bank'];

const parsePositiveAmount = (value: string): number => {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return 0;
	}
	return Number(parsed.toFixed(2));
};

export default function FriendSettleScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		friendId?: string;
		friendName?: string;
		amount?: string;
		groupId?: string;
	}>();

	const friendId = String(params.friendId || '');
	const friendName = String(params.friendName || 'Friend');
	const groupId = String(params.groupId || '');
	const handleBack = useBackNavigation('/settlements' as any, () => {
		if (friendId) {
			return (`/friends/${friendId}` as any);
		}
		return '/settlements' as any;
	});

	const initialAmount = useMemo(() => {
		const parsed = parsePositiveAmount(String(params.amount || ''));
		return parsed > 0 ? String(parsed) : '';
	}, [params.amount]);

	const [amount, setAmount] = useState(initialAmount);
	const [method, setMethod] = useState<'upi' | 'cash' | 'bank'>('upi');
	const [note, setNote] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const onBack = () => handleBack();

	const onSubmit = async () => {
		if (!friendId) {
			Alert.alert('Missing details', 'Friend details are missing for this settlement.');
			return;
		}

		const numericAmount = parsePositiveAmount(amount);
		if (!numericAmount) {
			Alert.alert('Invalid amount', 'Enter a valid amount greater than 0.');
			return;
		}

		try {
			void hapticImpactHeavy();
			setSubmitting(true);

			await createSettlement({
				to: friendId,
				amount: numericAmount,
				method,
				note: note.trim() || `Paid via ${method.toUpperCase()}`,
				...(groupId ? { groupId } : {}),
			});
			void hapticNotifySuccess();
			showSuccessToast('✅ Settled up!');

			Alert.alert('Payment recorded', `Settlement with ${friendName} has been recorded.`, [
				{
					text: 'OK',
					onPress: onBack,
				},
			]);
		} catch (error: any) {
			const message =
				error?.response?.data?.error ||
				error?.response?.data?.message ||
				'Failed to record settlement. Please try again.';
			Alert.alert('Server error', message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
						<Ionicons name='chevron-back' size={22} color='#F3F3FF' />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Record Payment</Text>
					<View style={styles.backPlaceholder} />
				</View>

				<View style={styles.card}>
					<Text style={styles.label}>Paying To</Text>
					<Text style={styles.friendName}>{friendName}</Text>

					<Text style={styles.label}>Amount</Text>
					<TextInput
						style={styles.input}
						value={amount}
						onChangeText={setAmount}
						placeholder='0.00'
						placeholderTextColor='rgba(243,243,255,0.45)'
						keyboardType='decimal-pad'
					/>

					<Text style={styles.label}>Method</Text>
					<View style={styles.methodsRow}>
						{PAYMENT_METHODS.map((item) => {
							const selected = item === method;
							return (
								<TouchableOpacity
									key={item}
									style={[styles.methodChip, selected && styles.methodChipSelected]}
									onPress={() => setMethod(item)}
									activeOpacity={0.85}
								>
									<Text style={[styles.methodText, selected && styles.methodTextSelected]}>
										{item.toUpperCase()}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					<Text style={styles.label}>Note (optional)</Text>
					<TextInput
						style={[styles.input, styles.noteInput]}
						value={note}
						onChangeText={setNote}
						placeholder='Add a note'
						placeholderTextColor='rgba(243,243,255,0.45)'
						multiline
						numberOfLines={3}
					/>

					<TouchableOpacity
						style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
						onPress={onSubmit}
						activeOpacity={0.9}
						disabled={submitting}
					>
						<Text style={styles.submitText}>{submitting ? 'Recording...' : 'Confirm Payment'}</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#0F0F1A',
	},
	container: {
		flex: 1,
		padding: 16,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 18,
	},
	backBtn: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#1A1A2B',
	},
	backPlaceholder: {
		width: 34,
		height: 34,
	},
	headerTitle: {
		color: '#F0F0FF',
		fontFamily: 'Syne_700Bold',
		fontSize: 24,
	},
	card: {
		backgroundColor: '#17172A',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(160,132,255,0.25)',
		padding: 16,
		gap: 10,
	},
	label: {
		color: '#C7C7D8',
		fontFamily: 'DMSans_500Medium',
		fontSize: 13,
		marginTop: 6,
	},
	friendName: {
		color: '#F3F3FF',
		fontFamily: 'DMSans_700Bold',
		fontSize: 17,
	},
	input: {
		backgroundColor: '#101022',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(160,132,255,0.22)',
		color: '#F3F3FF',
		fontFamily: 'DMSans_500Medium',
		fontSize: 15,
		paddingHorizontal: 12,
		paddingVertical: 11,
	},
	noteInput: {
		minHeight: 90,
		textAlignVertical: 'top',
	},
	methodsRow: {
		flexDirection: 'row',
		gap: 8,
	},
	methodChip: {
		borderRadius: 999,
		borderWidth: 1,
		borderColor: 'rgba(243,243,255,0.2)',
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	methodChipSelected: {
		backgroundColor: '#A084FF',
		borderColor: '#A084FF',
	},
	methodText: {
		color: '#DCDCEE',
		fontFamily: 'DMSans_700Bold',
		fontSize: 12,
	},
	methodTextSelected: {
		color: '#0F0F1A',
	},
	submitBtn: {
		marginTop: 8,
		borderRadius: 12,
		backgroundColor: '#34D399',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 13,
	},
	submitBtnDisabled: {
		opacity: 0.6,
	},
	submitText: {
		color: '#0F0F1A',
		fontFamily: 'DMSans_700Bold',
		fontSize: 15,
	},
});
