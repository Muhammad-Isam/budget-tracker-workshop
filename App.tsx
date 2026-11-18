import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  icon: string;
}

const CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', type: 'expense' },
  { name: 'Education & Books', icon: '📚', type: 'expense' },
  { name: 'Chai & Snacks', icon: '☕', type: 'expense' },
  { name: 'Entertainment', icon: '🎮', type: 'expense' },
  { name: 'Transport / Petrol', icon: '🚌', type: 'expense' },
  { name: 'Allowance / Salary', icon: '💰', type: 'income' },
  { name: 'Freelance / Tutoring', icon: '💻', type: 'income' },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', title: 'Monthly Pocket Allowance', amount: 25000, type: 'income', category: 'Allowance / Salary', date: 'Nov 15', icon: '💰' },
    { id: '2', title: 'College Cafeteria Lunch', amount: 450, type: 'expense', category: 'Food & Dining', date: 'Nov 16', icon: '🍔' },
    { id: '3', title: 'Python Programming Guide', amount: 1800, type: 'expense', category: 'Education & Books', date: 'Nov 17', icon: '📚' },
    { id: '4', title: 'Campus Chai & Paratha', amount: 250, type: 'expense', category: 'Chai & Snacks', date: 'Nov 17', icon: '☕' },
    { id: '5', title: 'Tutoring Coding Student', amount: 8000, type: 'income', category: 'Freelance / Tutoring', date: 'Nov 18', icon: '💻' },
    { id: '6', title: 'Bus Monthly Pass / Fuel', amount: 2500, type: 'expense', category: 'Transport / Petrol', date: 'Nov 18', icon: '🚌' },
  ]);

  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  // Financial calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const monthlyBudgetLimit = 20000; // Sample student budget goal in PKR
  const budgetProgress = Math.min((totalExpense / monthlyBudgetLimit) * 100, 100);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const handleAddTransaction = () => {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Entry', 'Please provide a valid title and positive amount in PKR.');
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parsedAmount,
      type: type,
      category: selectedCategory.name,
      icon: selectedCategory.icon,
      date: 'Today',
    };

    setTransactions([newTx, ...transactions]);
    setTitle('');
    setAmount('');
    setModalVisible(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const formatPKR = (val: number) => {
    return 'Rs ' + Math.abs(val).toLocaleString('en-US');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>STUDENT FINANCIAL HUB</Text>
          <Text style={styles.headerTitle}>Budget Tracker</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>CURRENT TOTAL BALANCE</Text>
          <Text style={[styles.balanceAmount, { color: balance >= 0 ? '#f8fafc' : '#f43f5e' }]}>
            {balance < 0 ? '-' : ''}{formatPKR(balance)}
          </Text>

          {/* Income & Expense Row */}
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#10b981' }]} />
              <View>
                <Text style={styles.metricSub}>Total Income</Text>
                <Text style={styles.incomeText}>+{formatPKR(totalIncome)}</Text>
              </View>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <View style={[styles.metricDot, { backgroundColor: '#f43f5e' }]} />
              <View>
                <Text style={styles.metricSub}>Total Expenses</Text>
                <Text style={styles.expenseText}>-{formatPKR(totalExpense)}</Text>
              </View>
            </View>
          </View>

          {/* Monthly Budget Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Monthly Limit: {formatPKR(monthlyBudgetLimit)}</Text>
              <Text style={styles.progressPercent}>{budgetProgress.toFixed(0)}% Spent</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${budgetProgress}%`,
                    backgroundColor: budgetProgress > 85 ? '#f43f5e' : '#6366f1',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['all', 'expense', 'income'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filter === tab && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[styles.filterChipText, filter === tab && styles.filterChipTextActive]}
              >
                {tab === 'all' ? 'All Activity' : tab === 'expense' ? 'Expenses' : 'Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Text style={styles.sectionCount}>{filteredTransactions.length} entries</Text>
        </View>

        {filteredTransactions.map(item => (
          <View key={item.id} style={styles.txCard}>
            <View style={styles.txIconContainer}>
              <Text style={styles.txIcon}>{item.icon}</Text>
            </View>

            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txCategory}>
                {item.category} • <Text style={styles.txDate}>{item.date}</Text>
              </Text>
            </View>

            <View style={styles.txRight}>
              <Text
                style={[
                  styles.txAmount,
                  { color: item.type === 'income' ? '#10b981' : '#f43f5e' },
                ]}
              >
                {item.type === 'income' ? '+' : '-'}{formatPKR(item.amount)}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteTransaction(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredTransactions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No transactions in this category yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type Switcher */}
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
                onPress={() => {
                  setType('expense');
                  setSelectedCategory(CATEGORIES[0]);
                }}
              >
                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
                onPress={() => {
                  setType('income');
                  setSelectedCategory(CATEGORIES[5]);
                }}
              >
                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <Text style={styles.inputLabel}>TITLE / DESCRIPTION</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Cafeteria Lunch, Books, Chai"
              placeholderTextColor="#64748b"
              value={title}
              onChangeText={setTitle}
            />

            {/* Amount Input */}
            <Text style={styles.inputLabel}>AMOUNT (PKR)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500, 2000"
              placeholderTextColor="#64748b"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Category Selector */}
            <Text style={styles.inputLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.filter(c => c.type === type).map(cat => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.catChip,
                    selectedCategory.name === cat.name && styles.catChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={styles.catChipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.catChipText,
                      selectedCategory.name === cat.name && styles.catChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.8}
              onPress={handleAddTransaction}
            >
              <Text style={styles.submitBtnText}>Save Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#161f36',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginTop: 8,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricSub: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  incomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },
  expenseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f43f5e',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 12,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#161f36',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  sectionCount: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161f36',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  txIcon: {
    fontSize: 20,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  txCategory: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  txDate: {
    color: '#64748b',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteText: {
    fontSize: 11,
    color: '#f43f5e',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#161f36',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  modalClose: {
    fontSize: 20,
    color: '#94a3b8',
    padding: 4,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeBtnExpense: {
    backgroundColor: '#f43f5e',
  },
  typeBtnIncome: {
    backgroundColor: '#10b981',
  },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  typeBtnTextActive: {
    color: '#ffffff',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  catScroll: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
  },
  catChipActive: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  catChipIcon: {
    fontSize: 14,
  },
  catChipText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
