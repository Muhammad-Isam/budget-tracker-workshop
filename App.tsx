import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StatusBar,
  ScrollView,
  StyleSheet,
} from 'react-native';

export type TransactionType = 'expense' | 'income';

export type Category =
  | 'Food'
  | 'Books'
  | 'Chai'
  | 'Entertainment'
  | 'Transport'
  | 'Salary'
  | 'Freelance';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
}

const CATEGORIES: { label: Category; emoji: string; defaultType: TransactionType }[] = [
  { label: 'Food', emoji: '🍔', defaultType: 'expense' },
  { label: 'Chai', emoji: '☕', defaultType: 'expense' },
  { label: 'Transport', emoji: '🚗', defaultType: 'expense' },
  { label: 'Books', emoji: '📚', defaultType: 'expense' },
  { label: 'Entertainment', emoji: '🎬', defaultType: 'expense' },
  { label: 'Salary', emoji: '💼', defaultType: 'income' },
  { label: 'Freelance', emoji: '💻', defaultType: 'income' },
];

export default function App(): React.JSX.Element {
  // ZERO pre-seeded data as per requirements
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [monthlyLimit, setMonthlyLimit] = useState<number>(20000);

  // Modal State
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState<boolean>(false);
  const [newBudgetInput, setNewBudgetInput] = useState<string>('20000');

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>('Food');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Delete Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<Transaction | null>(null);

  // Calculations
  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    }
    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense,
    };
  }, [transactions]);

  const budgetProgress = useMemo(() => {
    if (monthlyLimit <= 0) return 0;
    return Math.min(Math.round((totalExpense / monthlyLimit) * 100), 100);
  }, [totalExpense, monthlyLimit]);

  const remainingBudget = monthlyLimit - totalExpense;

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  const formatPKR = (val: number): string => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const parts = absVal.toLocaleString('en-PK', {
      maximumFractionDigits: 0,
    });
    return isNegative ? `-Rs ${parts}` : `Rs ${parts}`;
  };

  const handleOpenAddModal = (initialType: TransactionType = 'expense') => {
    setTitle('');
    setAmount('');
    setType(initialType);
    setCategory(initialType === 'income' ? 'Salary' : 'Food');
    setErrorMessage('');
    setModalVisible(true);
  };

  const handleSaveTransaction = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Please enter a valid title or description.');
      return;
    }

    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please enter a valid positive numeric amount (PKR).');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-PK', {
      month: 'short',
      day: 'numeric',
    }) + ' • ' + now.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newTx: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      title: trimmedTitle,
      amount: numericAmount,
      type,
      category,
      date: formattedDate,
    };

    setTransactions(prev => [newTx, ...prev]);
    setModalVisible(false);
  };

  const confirmDelete = (tx: Transaction) => {
    setItemToDelete(tx);
  };

  const executeDelete = () => {
    if (itemToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const handleSaveBudget = () => {
    const parsed = parseFloat(newBudgetInput.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      setMonthlyLimit(parsed);
      setBudgetModalVisible(false);
    }
  };

  const getCategoryEmoji = (cat: Category): string => {
    const found = CATEGORIES.find(c => c.label === cat);
    return found ? found.emoji : '💸';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064E3B" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Budget Tracker</Text>
            <Text style={styles.headerSubtitle}>Personal Finance • PKR (Rs)</Text>
          </View>
          <TouchableOpacity
            style={styles.headerAddBtn}
            activeOpacity={0.8}
            onPress={() => handleOpenAddModal('expense')}>
            <Text style={styles.headerAddBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance Hero Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <View
              style={[
                styles.balanceStatusPill,
                { backgroundColor: totalBalance >= 0 ? '#D1FAE5' : '#FFE4E6' },
              ]}>
              <Text
                style={[
                  styles.balanceStatusText,
                  { color: totalBalance >= 0 ? '#065F46' : '#9F1239' },
                ]}>
                {totalBalance >= 0 ? 'Surplus' : 'Deficit'}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.balanceValue,
              { color: totalBalance >= 0 ? '#047857' : '#E11D48' },
            ]}>
            {formatPKR(totalBalance)}
          </Text>

          {/* Income & Expense Summary Row */}
          <View style={styles.summaryRow}>
            <TouchableOpacity
              style={styles.summaryBox}
              activeOpacity={0.8}
              onPress={() => handleOpenAddModal('income')}>
              <View style={styles.summaryIconBadgeGreen}>
                <Text style={styles.summaryIconText}>↑</Text>
              </View>
              <View style={styles.summaryTextGroup}>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={styles.incomeValue}>
                  +{formatPKR(totalIncome)}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.summaryDivider} />

            <TouchableOpacity
              style={styles.summaryBox}
              activeOpacity={0.8}
              onPress={() => handleOpenAddModal('expense')}>
              <View style={styles.summaryIconBadgeRed}>
                <Text style={styles.summaryIconTextRed}>↓</Text>
              </View>
              <View style={styles.summaryTextGroup}>
                <Text style={styles.summaryLabel}>Total Expense</Text>
                <Text style={styles.expenseValue}>
                  -{formatPKR(totalExpense)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <View style={styles.body}>
        {/* Monthly Budget Limit Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.budgetTitle}>Monthly Budget Limit</Text>
              <Text style={styles.budgetSubtitle}>
                Target: {formatPKR(monthlyLimit)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editBudgetBtn}
              onPress={() => {
                setNewBudgetInput(monthlyLimit.toString());
                setBudgetModalVisible(true);
              }}>
              <Text style={styles.editBudgetText}>Edit Limit</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${budgetProgress}%`,
                  backgroundColor:
                    totalExpense > monthlyLimit
                      ? '#E11D48'
                      : budgetProgress > 80
                      ? '#F59E0B'
                      : '#10B981',
                },
              ]}
            />
          </View>

          {/* Progress Stats */}
          <View style={styles.budgetStatsRow}>
            <Text style={styles.budgetSpentText}>
              Spent: <Text style={styles.boldText}>{formatPKR(totalExpense)}</Text> ({budgetProgress}%)
            </Text>
            <Text
              style={[
                styles.budgetRemainingText,
                { color: remainingBudget < 0 ? '#E11D48' : '#059669' },
              ]}>
              {remainingBudget >= 0
                ? `Rem: ${formatPKR(remainingBudget)}`
                : `Over: ${formatPKR(Math.abs(remainingBudget))}`}
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'all' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('all')}>
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}>
              All Activity ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'expense' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('expense')}>
            <Text
              style={[
                styles.filterTabText,
                filter === 'expense' && styles.filterTabTextActive,
              ]}>
              Expenses ({transactions.filter(t => t.type === 'expense').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'income' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('income')}>
            <Text
              style={[
                styles.filterTabText,
                filter === 'income' && styles.filterTabTextActive,
              ]}>
              Income ({transactions.filter(t => t.type === 'income').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyEmoji}>₨</Text>
              </View>
              <Text style={styles.emptyTitle}>No transactions recorded yet</Text>
              <Text style={styles.emptyDescription}>
                {filter === 'all'
                  ? 'Start by recording your daily chai, transport, food expenses or salary income.'
                  : `No ${filter} transactions found for this filter.`}
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => handleOpenAddModal('expense')}>
                <Text style={styles.emptyAddBtnText}>+ Add First Transaction</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.txCard}>
              <View style={styles.txLeft}>
                <View
                  style={[
                    styles.txCategoryCircle,
                    {
                      backgroundColor:
                        item.type === 'income' ? '#ECFDF5' : '#FFF1F2',
                    },
                  ]}>
                  <Text style={styles.txCategoryEmoji}>
                    {getCategoryEmoji(item.category)}
                  </Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{item.title}</Text>
                  <View style={styles.txMetaRow}>
                    <Text style={styles.txCategoryName}>{item.category}</Text>
                    <Text style={styles.txDot}>•</Text>
                    <Text style={styles.txDate}>{item.date}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.txRight}>
                <Text
                  style={[
                    styles.txAmount,
                    {
                      color: item.type === 'income' ? '#059669' : '#E11D48',
                    },
                  ]}>
                  {item.type === 'income' ? '+' : '-'}
                  {formatPKR(item.amount)}
                </Text>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDelete(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => handleOpenAddModal('expense')}>
        <Text style={styles.fabText}>+ Record Transaction</Text>
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <Text style={styles.inputLabel}>TRANSACTION TYPE</Text>
              <View style={styles.typeSwitcher}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === 'expense' && styles.typeBtnExpenseActive,
                  ]}
                  onPress={() => {
                    setType('expense');
                    if (category === 'Salary' || category === 'Freelance') {
                      setCategory('Food');
                    }
                  }}>
                  <Text
                    style={[
                      styles.typeBtnText,
                      type === 'expense' && styles.typeBtnTextActive,
                    ]}>
                    Expense (-)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === 'income' && styles.typeBtnIncomeActive,
                  ]}
                  onPress={() => {
                    setType('income');
                    setCategory('Salary');
                  }}>
                  <Text
                    style={[
                      styles.typeBtnText,
                      type === 'income' && styles.typeBtnTextActive,
                    ]}>
                    Income (+)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <Text style={styles.inputLabel}>DESCRIPTION / TITLE *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Chai at Quetta Cafe, Monthly Groceries"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={text => {
                  setTitle(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />

              {/* Amount Input */}
              <Text style={styles.inputLabel}>AMOUNT (PKR - Rs) *</Text>
              <View style={styles.amountInputRow}>
                <Text style={styles.amountPrefix}>Rs</Text>
                <TextInput
                  style={[styles.textInput, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={text => {
                    setAmount(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </View>

              {/* Category Selection Chips */}
              <Text style={styles.inputLabel}>CATEGORY CHIP</Text>
              <View style={styles.chipContainer}>
                {CATEGORIES.map(cat => {
                  const isSelected = category === cat.label;
                  return (
                    <TouchableOpacity
                      key={cat.label}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                      onPress={() => setCategory(cat.label)}>
                      <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                </View>
              ) : null}

              {/* Submit Buttons */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    type === 'expense'
                      ? styles.submitBtnExpense
                      : styles.submitBtnIncome,
                  ]}
                  onPress={handleSaveTransaction}>
                  <Text style={styles.submitBtnText}>
                    Save {type === 'expense' ? 'Expense' : 'Income'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!itemToDelete}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setItemToDelete(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete Transaction?</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to remove &quot;{itemToDelete?.title}&quot; (
              {itemToDelete ? formatPKR(itemToDelete.amount) : ''})?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setItemToDelete(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={executeDelete}>
                <Text style={styles.deleteConfirmBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Budget Limit Modal */}
      <Modal
        visible={budgetModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setBudgetModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Edit Monthly Budget</Text>
            <Text style={styles.confirmText}>
              Set your target monthly spending threshold in Pakistani Rupees (PKR):
            </Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.amountPrefix}>Rs</Text>
              <TextInput
                style={[styles.textInput, styles.amountInput]}
                placeholder="20000"
                keyboardType="numeric"
                value={newBudgetInput}
                onChangeText={setNewBudgetInput}
              />
            </View>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setBudgetModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBudgetBtn}
                onPress={handleSaveBudget}>
                <Text style={styles.saveBudgetBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    backgroundColor: '#064E3B',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A7F3D0',
    fontWeight: '500',
    marginTop: 2,
  },
  headerAddBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  headerAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#64748B',
  },
  balanceStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  balanceStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBadgeGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryIconText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '900',
  },
  summaryIconBadgeRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryIconTextRed: {
    color: '#E11D48',
    fontSize: 16,
    fontWeight: '900',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  incomeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginTop: 1,
  },
  expenseValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E11D48',
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  budgetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  editBudgetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  editBudgetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  progressBarTrack: {
    height: 9,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  budgetStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetSpentText: {
    fontSize: 12,
    color: '#475569',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  budgetRemainingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#065F46',
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 90,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  txCategoryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txCategoryEmoji: {
    fontSize: 20,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txCategoryName: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  txDot: {
    fontSize: 10,
    color: '#94A3B8',
    marginHorizontal: 5,
  },
  txDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  txRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  deleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteBtnText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyEmoji: {
    fontSize: 28,
    fontWeight: '900',
    color: '#059669',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyAddBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeBtnExpenseActive: {
    backgroundColor: '#E11D48',
  },
  typeBtnIncomeActive: {
    backgroundColor: '#059669',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  amountPrefix: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    fontWeight: '700',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#065F46',
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  errorText: {
    color: '#BE123C',
    fontSize: 12,
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  submitBtnExpense: {
    backgroundColor: '#E11D48',
  },
  submitBtnIncome: {
    backgroundColor: '#059669',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    marginBottom: 'auto',
    marginTop: 'auto',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#E11D48',
  },
  deleteConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  saveBudgetBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  saveBudgetBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
