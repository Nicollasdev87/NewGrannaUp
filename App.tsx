
import React, { useState, useEffect } from 'react';
import { AppScreen, Transaction, Goal, Investment, UserProfile, GoalContribution, Dividend, RecurringTransaction, Category, CreditCard } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Investments from './components/Investments';
import Transactions from './components/Transactions';
import Goals from './components/Goals';
import Calendar from './components/Calendar';
import Settings from './components/Settings';
import Profile from './components/Profile';
import AddTransactionModal from './components/AddTransactionModal';
import AddGoalModal from './components/AddGoalModal';
import AddContributionModal from './components/AddContributionModal';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import ConfirmModal from './components/ConfirmModal';
import Toast, { ToastContainer, ToastProps } from './components/Toast';
import GoalContributionsModal from './components/GoalContributionsModal';
import Footer from './components/Footer';

import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import { DEFAULT_CATEGORIES } from './constants';


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSetScreen = (newScreen: AppScreen) => {
    if (hasUnsavedChanges) {
      showConfirm(
        'Alterações não salvas',
        'Você tem alterações que não foram salvas. Deseja realmente sair e descartar as mudanças?',
        () => {
          setHasUnsavedChanges(false);
          setCurrentScreen(newScreen);
        },
        'warning'
      );
    } else {
      setCurrentScreen(newScreen);
    }
  };

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Preference State
  const [useCustomCategories, setUseCustomCategories] = useState(() => {
    const saved = localStorage.getItem('useCustomCategories');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('useCustomCategories', JSON.stringify(useCustomCategories));
  }, [useCustomCategories]);
  const [user, setUser] = useState<UserProfile>({
    name: 'Usuário',
    email: '',
    phone: '',
    birthDate: '',
    occupation: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (profile) {
      setUser({
        name: profile.name || '',
        email: session?.user.email || '',
        phone: profile.phone || '',
        birthDate: profile.birth_date || '',
        occupation: profile.occupation || '',
        avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'
      });
    }
  };

  const fetchData = async () => {
    if (!session?.user.id) return;

    // Fetch Transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });

    if (txData) {
      setTransactions(txData.map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        category: tx.category,
        type: tx.type as 'income' | 'expense' | 'investment',
        value: Number(tx.value),
        icon: tx.icon,
        paymentMethod: tx.payment_method,
        installments: tx.installments,
        cardBrand: tx.card_brand,
        installmentNumber: tx.installment_number,
        totalInstallments: tx.total_installments,
        isBillPayment: tx.is_bill_payment,
        billCardBrand: tx.bill_card_brand
      })));
    }

    // Fetch Goals
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', session.user.id);

    if (goalsData) {
      setGoals(goalsData.map(g => ({
        id: g.id,
        title: g.title,
        deadline: g.deadline,
        currentValue: Number(g.current_value),
        targetValue: Number(g.target_value),
        category: g.category,
        color: g.color,
        icon: g.icon,
        backgroundImage: g.background_image || undefined,
        status: g.status as any,
        lastContributionDate: g.last_contribution_date || undefined,
        monthlyContribution: Number(g.monthly_contribution),
        completionDate: g.completion_date || undefined
      })));
    }

    // Fetch Investments
    const { data: invData } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', session.user.id);

    if (invData) {
      setInvestments(invData.map(inv => ({
        id: inv.id,
        name: inv.name,
        ticker: inv.ticker || undefined,
        category: inv.category as any,
        quantity: Number(inv.quantity),
        purchasePrice: Number(inv.purchase_price),
        currentPrice: Number(inv.current_price),
        totalValue: Number(inv.total_value),
        percentage: Number(inv.percentage),
        color: inv.color,
        icon: inv.icon,
        date: inv.created_at ? inv.created_at.split('T')[0] : undefined
      })));
    }
    // Fetch Goal Contributions
    const { data: contribData } = await supabase
      .from('goal_contributions')
      .select('*')
      .eq('user_id', session.user.id);

    if (contribData) {
      setGoalContributions(contribData.map(c => ({
        id: c.id,
        goalId: c.goal_id,
        amount: Number(c.amount),
        date: c.date
      })));
    }
    // Fetch Dividends
    const { data: divData } = await supabase
      .from('dividends')
      .select('*')
      .eq('user_id', session.user.id);

    if (divData) {
      setDividends(divData.map(d => ({
        id: d.id,
        investmentId: d.investment_id,
        assetName: d.asset_name,
        value: Number(d.value),
        date: d.date
      })));
    }

    // Fetch Recurring Transactions
    const { data: recData } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', session.user.id);

    if (recData) {
      setRecurringTransactions(recData.map(r => ({
        id: r.id,
        daysOfMonth: r.days_of_month || [],
        description: r.description,
        category: r.category,
        type: r.type as 'income' | 'expense',
        value: Number(r.value),
        icon: r.icon
      })));
    }

    // Fetch Categories
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', session.user.id);

    if (catData) {
      setCategories(catData.map(c => ({
        ...c, userId: c.user_id
      })));
    }

    // Fetch Credit Cards
    const { data: cardData } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', session.user.id);

    if (cardData) {
      setCreditCards(cardData.map(c => ({
        ...c, userId: c.user_id, closingDay: c.closing_day, limit: Number(c.limit)
      })));
    }
  };



  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      setTransactions([]);
      setGoals([]);
      setInvestments([]);
    }
  }, [session]);


  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    if (!session?.user.id) return;

    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: updatedProfile.name }
      });
      if (authError) throw authError;

      // Update profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          phone: updatedProfile.phone,
          birth_date: updatedProfile.birthDate,
          occupation: updatedProfile.occupation,
          avatar_url: updatedProfile.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (dbError) throw dbError;

      setUser(updatedProfile);
      setHasUnsavedChanges(false);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showToast('Erro ao atualizar perfil', 'error');
    }
  };

  const handleLogout = async () => {
    showConfirm(
      'Sair da Conta',
      'Deseja realmente sair da sua conta?',
      async () => {
        await supabase.auth.signOut();
      },
      'warning'
    );
  };




  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goalContributions, setGoalContributions] = useState<GoalContribution[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
    type: 'confirm' | 'alert';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'danger',
    type: 'confirm'
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' | 'success' = 'danger') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      variant,
      type: 'confirm'
    });
  };

  const showAlert = (title: string, message: string, variant: 'danger' | 'warning' | 'info' | 'success' = 'info') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
      variant,
      type: 'alert'
    });
  };

  // Toast State
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<Goal | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedGoalForHistory, setSelectedGoalForHistory] = useState<Goal | null>(null);


  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!session?.user.id) return;

    if (editingTransaction) {
      const { error } = await supabase
        .from('transactions')
        .update({
          date: newTransaction.date,
          description: newTransaction.description,
          category: newTransaction.category,
          type: newTransaction.type,
          value: newTransaction.value,
          icon: newTransaction.icon,
          payment_method: newTransaction.paymentMethod,
          installments: newTransaction.installments,
          card_brand: newTransaction.cardBrand,
          installment_number: newTransaction.installmentNumber,
          total_installments: newTransaction.totalInstallments
        })
        .eq('id', editingTransaction.id);

      if (error) {
        showToast('Erro ao atualizar transação', 'error');
        return;
      }

      setTransactions(transactions.map(tx => tx.id === editingTransaction.id ? { ...newTransaction, id: editingTransaction.id } : tx));
      setEditingTransaction(null);
      showToast('Transação atualizada com sucesso!');
    } else {

      const txsToInsert = [];
      const totalInstallments = newTransaction.totalInstallments || 1;

      if (totalInstallments > 1 && newTransaction.type === 'expense') {
        const installmentValue = newTransaction.value / totalInstallments;
        const baseDate = new Date(newTransaction.date + 'T12:00:00'); // Use noon to avoid timezone shift

        for (let i = 0; i < totalInstallments; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(baseDate.getMonth() + i);

          const year = installmentDate.getFullYear();
          const month = String(installmentDate.getMonth() + 1).padStart(2, '0');
          const day = String(installmentDate.getDate()).padStart(2, '0');

          txsToInsert.push({
            user_id: session.user.id,
            date: `${year}-${month}-${day}`,
            description: newTransaction.description,
            category: newTransaction.category,
            type: (newTransaction.category === 'Investimento' || newTransaction.category === 'Investimentos') ? 'investment' : newTransaction.type,
            value: installmentValue,
            icon: newTransaction.icon,
            payment_method: newTransaction.paymentMethod,
            installments: newTransaction.installments,
            card_brand: newTransaction.cardBrand,
            installment_number: i + 1,
            total_installments: totalInstallments
          });
        }
      } else {
        txsToInsert.push({
          user_id: session.user.id,
          date: newTransaction.date,
          description: newTransaction.description,
          category: newTransaction.category,
          type: newTransaction.type,
          value: newTransaction.value,
          icon: newTransaction.icon,
          payment_method: newTransaction.paymentMethod,
          installments: newTransaction.installments,
          card_brand: newTransaction.cardBrand,
          installment_number: newTransaction.installmentNumber,
          total_installments: newTransaction.totalInstallments
        });
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert(txsToInsert)
        .select();

      if (error) {
        showToast('Erro ao salvar transação', 'error');
        console.error(error);
        return;
      }

      if (data) {
        // Map Supabase response to Transaction type
        const newTxs: Transaction[] = data.map(t => ({
          id: t.id,
          date: t.date,
          description: t.description,
          category: t.category,
          type: t.type,
          value: t.value,
          icon: t.icon,
          paymentMethod: t.payment_method,
          installments: t.installments,
          cardBrand: t.card_brand,
          installmentNumber: t.installment_number,
          totalInstallments: t.total_installments
        }));

        setTransactions([...newTxs, ...transactions]);
        showToast(totalInstallments > 1 ? `${totalInstallments} parcelas criadas com sucesso!` : 'Transação criada com sucesso!');

        // Check for Dividendos logic
        if (newTransaction.type === 'income' && newTransaction.category === 'Dividendos') {
          const matchingInvestment = investments.find(inv =>
            (inv.ticker && newTransaction.description.toUpperCase().includes(inv.ticker.toUpperCase())) ||
            (inv.name && newTransaction.description.toUpperCase().includes(inv.name.toUpperCase()))
          );

          const { data: divData } = await supabase
            .from('dividends')
            .insert([{
              user_id: session.user.id,
              investment_id: matchingInvestment?.id || null,
              asset_name: matchingInvestment ? (matchingInvestment.ticker || matchingInvestment.name) : newTransaction.description,
              value: newTransaction.value,
              date: newTransaction.date
            }])
            .select();

          if (divData && divData[0]) {
            setDividends(prev => [{
              id: divData[0].id,
              investmentId: divData[0].investment_id,
              assetName: divData[0].asset_name,
              value: Number(divData[0].value),
              date: divData[0].date
            }, ...prev]);
            showToast('Dividendo registrado em Investimentos!', 'success');
          }
        }
      }
    }
    setIsModalOpen(false);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    showConfirm(
      'Excluir Transação',
      'Deseja realmente excluir esta transação? Esta ação não pode ser desfeita.',
      async () => {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (error) {
          showToast('Erro ao excluir transação', 'error');
          return;
        }

        setTransactions(transactions.filter(tx => tx.id !== id));
        showToast('Transação excluída com sucesso!');
      }
    );
  };

  const handleDeleteMultipleTransactions = async (ids: string[]) => {
    showConfirm(
      'Excluir Selecionados',
      `Deseja realmente excluir as ${ids.length} transações selecionadas? Esta ação não pode ser desfeita.`,
      async () => {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .in('id', ids);

        if (error) {
          showToast('Erro ao excluir transações', 'error');
          return;
        }

        setTransactions(transactions.filter(tx => !ids.includes(tx.id)));
        showToast(`${ids.length} transações excluídas com sucesso!`);
      },
      'danger'
    );
  };


  const handleSaveGoal = async (goalData: Omit<Goal, 'id' | 'status'>) => {
    if (!session?.user.id) return;

    if (editingGoal) {
      const { error } = await supabase
        .from('goals')
        .update({
          title: goalData.title,
          deadline: goalData.deadline,
          target_value: goalData.targetValue,
          category: goalData.category,
          icon: goalData.icon,
          background_image: goalData.backgroundImage,
          monthly_contribution: goalData.monthlyContribution,
          current_value: goalData.currentValue // Allow updating current value directly if needed
        })
        .eq('id', editingGoal.id);

      if (error) {
        showToast('Erro ao atualizar meta', 'error');
        return;
      }

      setGoals(goals.map(g => g.id === editingGoal.id ? { ...goalData, id: editingGoal.id, status: editingGoal.status } : g));
      setEditingGoal(null);
      showToast('Meta atualizada com sucesso!');
    } else {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          user_id: session.user.id,
          title: goalData.title,
          deadline: goalData.deadline,
          target_value: goalData.targetValue,
          category: goalData.category,
          icon: goalData.icon,
          background_image: goalData.backgroundImage,
          status: 'Iniciado',
          monthly_contribution: goalData.monthlyContribution,
          current_value: goalData.currentValue || 0
        }])
        .select();

      if (error) {
        showToast('Erro ao criar meta', 'error');
        return;
      }

      if (data) {
        const goalWithId: Goal = {
          ...goalData,
          id: data[0].id,
          currentValue: goalData.currentValue || 0,
          status: 'Iniciado',
        };
        setGoals([...goals, goalWithId]);
        showToast('Meta criada com sucesso!');
      }
    }
    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = async (id: string) => {
    showConfirm(
      'Excluir Meta',
      'Tem certeza que deseja excluir esta meta? Todo o progresso será perdido.',
      async () => {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id);

        if (error) {
          showToast('Erro ao excluir meta', 'error');
          return;
        }

        setGoals(goals.filter(g => g.id !== id));
        showToast('Meta excluída com sucesso!');
      }
    );
  };


  const handleOpenEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenAddContribution = (goal: Goal) => {
    setSelectedGoalForContribution(goal);
    setIsContributionModalOpen(true);
  };

  const handleAddContribution = async (amount: number, date: string) => {
    if (selectedGoalForContribution && session?.user.id) {
      try {
        const newCurrentValue = selectedGoalForContribution.currentValue + amount;
        const isCompleted = newCurrentValue >= selectedGoalForContribution.targetValue;
        const completionDate = isCompleted && !selectedGoalForContribution.completionDate ? date : (isCompleted ? selectedGoalForContribution.completionDate : null);

        // 1. Insert into history
        const { data: historyData, error: historyError } = await supabase
          .from('goal_contributions')
          .insert([{
            goal_id: selectedGoalForContribution.id,
            user_id: session.user.id,
            amount: amount,
            date: date
          }])
          .select();

        if (historyError) {
          showToast('Erro no Histórico', 'error');
          return;
        }

        // 2. Update goal summary
        const { error } = await supabase
          .from('goals')
          .update({
            current_value: newCurrentValue,
            last_contribution_date: date,
            completion_date: completionDate
          })
          .eq('id', selectedGoalForContribution.id);

        if (error) {
          showToast('Erro ao registrar aporte', 'error');
          return;
        }

        if (historyData && historyData[0]) {
          setGoalContributions([{
            id: historyData[0].id,
            goalId: historyData[0].goal_id,
            amount: Number(historyData[0].amount),
            date: historyData[0].date
          }, ...goalContributions]);
        }

        // Refresh goals to show new currentValue
        fetchData();
        showToast('Aporte registrado com sucesso!');
      } catch (err) {
        showToast('Erro ao processar aporte', 'error');
      }
      setIsContributionModalOpen(false);
      setSelectedGoalForContribution(null);
    }
  };


  const handleAddInvestment = async (investmentData: Omit<Investment, 'id'>, transactionDate?: string) => {
    if (!session?.user.id) return;

    // Check for existing investment by ticker (primary) or name (fallback)
    const existingInvestment = investments.find(inv =>
      (investmentData.ticker && inv.ticker && inv.ticker.toLowerCase() === investmentData.ticker.toLowerCase()) ||
      (!investmentData.ticker && inv.name.toLowerCase() === investmentData.name.toLowerCase() && inv.category === investmentData.category)
    );

    if (existingInvestment) {
      // Merge: Calculate weighted average purchase price
      const oldTotal = existingInvestment.quantity * existingInvestment.purchasePrice;
      const newTotal = investmentData.quantity * investmentData.purchasePrice;
      const combinedQuantity = existingInvestment.quantity + investmentData.quantity;
      const weightedAvgPrice = (oldTotal + newTotal) / combinedQuantity;
      const newTotalValue = combinedQuantity * investmentData.currentPrice;

      const { error } = await supabase
        .from('investments')
        .update({
          quantity: combinedQuantity,
          purchase_price: weightedAvgPrice,
          current_price: investmentData.currentPrice,
          total_value: newTotalValue
        })
        .eq('id', existingInvestment.id);

      if (error) {
        showToast('Erro ao atualizar investimento', 'error');
        return;
      }

      // Update local state
      setInvestments(investments.map(inv =>
        inv.id === existingInvestment.id
          ? { ...inv, quantity: combinedQuantity, purchasePrice: weightedAvgPrice, currentPrice: investmentData.currentPrice, totalValue: newTotalValue }
          : inv
      ));

      // Create transaction for the new contribution
      const investmentCost = investmentData.quantity * investmentData.purchasePrice;
      const { data: txData } = await supabase
        .from('transactions')
        .insert([{
          user_id: session.user.id,
          date: transactionDate || new Date().toISOString().split('T')[0],
          description: `Aporte: ${investmentData.ticker || investmentData.name}`,
          category: 'Investimento',
          type: 'investment',
          value: investmentCost,
          icon: investmentData.icon,
          payment_method: 'Saldo'
        }])
        .select();

      if (txData && txData[0]) {
        const newTx: Transaction = {
          id: txData[0].id,
          date: txData[0].date,
          description: txData[0].description,
          category: txData[0].category,
          type: 'investment',
          value: Number(txData[0].value),
          icon: txData[0].icon,
          paymentMethod: txData[0].payment_method
        };
        setTransactions([newTx, ...transactions]);
      }

      showToast(`Aporte adicionado ao ${existingInvestment.ticker || existingInvestment.name}! Preço médio atualizado.`);
      return;
    }

    // No duplicate found - create new investment
    const { data, error } = await supabase
      .from('investments')
      .insert([{
        user_id: session.user.id,
        name: investmentData.name,
        ticker: investmentData.ticker,
        category: investmentData.category,
        quantity: investmentData.quantity,
        purchase_price: investmentData.purchasePrice,
        current_price: investmentData.currentPrice,
        total_value: investmentData.totalValue,
        percentage: investmentData.percentage,
        color: investmentData.color,
        icon: investmentData.icon
      }])
      .select();

    if (error) {
      showToast('Erro ao salvar investimento', 'error');
      return;
    }

    if (data && data[0]) {
      const newInvestment = {
        ...investmentData,
        id: data[0].id,
        totalValue: investmentData.quantity * investmentData.currentPrice
      };

      setInvestments([newInvestment, ...investments]);

      // Automatically create a transaction for this investment
      const investmentCost = investmentData.quantity * investmentData.purchasePrice;
      const { data: txData } = await supabase
        .from('transactions')
        .insert([{
          user_id: session.user.id,
          date: transactionDate || new Date().toISOString().split('T')[0],
          description: `Aporte: ${investmentData.ticker || investmentData.name}`,
          category: 'Investimento',
          type: 'investment',
          value: investmentCost,
          icon: investmentData.icon,
          payment_method: 'Saldo'
        }])
        .select();

      if (txData && txData[0]) {
        const newTx: Transaction = {
          id: txData[0].id,
          date: txData[0].date,
          description: txData[0].description,
          category: txData[0].category,
          type: 'investment',
          value: Number(txData[0].value),
          icon: txData[0].icon,
          paymentMethod: txData[0].payment_method
        };
        setTransactions([newTx, ...transactions]);
      }

      showToast('Investimento e Aporte registrados com sucesso!');
    }
  };

  const handleEditInvestment = async (id: string, investmentData: Omit<Investment, 'id'>) => {
    const { error } = await supabase
      .from('investments')
      .update({
        name: investmentData.name,
        ticker: investmentData.ticker,
        category: investmentData.category,
        quantity: investmentData.quantity,
        purchase_price: investmentData.purchasePrice,
        current_price: investmentData.currentPrice,
        total_value: investmentData.totalValue,
        percentage: investmentData.percentage,
        color: investmentData.color,
        icon: investmentData.icon
      })
      .eq('id', id);

    if (error) {
      showToast('Erro ao atualizar investimento', 'error');
      return;
    }

    setInvestments(investments.map(inv =>
      inv.id === id ? { ...investmentData, id, totalValue: investmentData.quantity * investmentData.currentPrice } : inv
    ));
    showToast('Investimento atualizado com sucesso!');
  };

  const handleAddDividend = async (dividendData: Omit<Dividend, 'id'>) => {
    if (!session?.user.id) return;

    const { data, error } = await supabase
      .from('dividends')
      .insert([{
        user_id: session.user.id,
        investment_id: dividendData.investmentId,
        asset_name: dividendData.assetName,
        value: dividendData.value,
        date: dividendData.date
      }])
      .select();

    if (error) {
      showToast('Erro ao salvar dividendo', 'error');
      return;
    }

    if (data && data[0]) {
      setDividends([{
        id: data[0].id,
        investmentId: data[0].investment_id,
        assetName: data[0].asset_name,
        value: Number(data[0].value),
        date: data[0].date
      }, ...dividends]);
      showToast('Dividendo registrado com sucesso!');
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    showConfirm(
      'Excluir Investimento',
      'Tem certeza que deseja excluir este investimento? Os dados históricos serão removidos.',
      async () => {
        const { error } = await supabase
          .from('investments')
          .delete()
          .eq('id', id);

        if (error) {
          showToast('Erro ao excluir investimento', 'error');
          return;
        }

        setInvestments(investments.filter(inv => inv.id !== id));
        showToast('Investimento excluído com sucesso!');
      }
    );
  };

  const handleAddRecurringTransaction = async (transactionData: Omit<RecurringTransaction, 'id'>) => {
    if (!session?.user.id) return;

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert([{
        user_id: session.user.id,
        days_of_month: transactionData.daysOfMonth,
        description: transactionData.description,
        category: transactionData.category,
        type: transactionData.type,
        value: transactionData.value,
        icon: transactionData.icon
      }])
      .select();

    if (error) {
      showToast('Erro ao criar lançamento fixo', 'error');
      return;
    }

    if (data && data[0]) {
      setRecurringTransactions([{
        id: data[0].id,
        daysOfMonth: data[0].days_of_month || [],
        description: data[0].description,
        category: data[0].category,
        type: data[0].type as 'income' | 'expense',
        value: Number(data[0].value),
        icon: data[0].icon
      }, ...recurringTransactions]);
      showToast('Lançamento fixo criado com sucesso!');
    }
  };

  const handleEditRecurringTransaction = async (id: string, transactionData: Omit<RecurringTransaction, 'id'>) => {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({
        days_of_month: transactionData.daysOfMonth,
        description: transactionData.description,
        category: transactionData.category,
        type: transactionData.type,
        value: transactionData.value,
        icon: transactionData.icon
      })
      .eq('id', id);

    if (error) {
      showToast('Erro ao atualizar lançamento fixo', 'error');
      return;
    }

    setRecurringTransactions(recurringTransactions.map(t =>
      t.id === id ? { ...transactionData, id } : t
    ));
    showToast('Lançamento fixo atualizado com sucesso!');
  };

  const handleDeleteRecurringTransaction = async (id: string) => {
    showConfirm(
      'Excluir Lançamento Fixo',
      'Deseja realmente excluir este lançamento fixo do seu calendário?',
      async () => {
        const { error } = await supabase
          .from('recurring_transactions')
          .delete()
          .eq('id', id);

        if (error) {
          showToast('Erro ao excluir lançamento fixo', 'error');
          return;
        }

        setRecurringTransactions(recurringTransactions.filter(t => t.id !== id));
        showToast('Lançamento fixo excluído com sucesso!');
      }
    );
  };


  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.DASHBOARD:
        return <Dashboard
          userName={user.name}
          transactions={transactions}
          goals={goals}
          investments={investments}
          goalContributions={goalContributions}
          categories={useCustomCategories ? categories : DEFAULT_CATEGORIES}
          onOpenAddTransactionModal={() => setIsModalOpen(true)}
          onViewAllTransactions={() => setCurrentScreen(AppScreen.TRANSACTIONS)}
          onNavigateToGoals={() => setCurrentScreen(AppScreen.GOALS)}
        />;
      case AppScreen.TRANSACTIONS:
        return <Transactions
          transactions={transactions}
          categories={useCustomCategories ? categories : DEFAULT_CATEGORIES}
          creditCards={creditCards}
          onOpenAddTransactionModal={() => { setEditingTransaction(null); setIsModalOpen(true); }}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onDeleteMultiple={handleDeleteMultipleTransactions}
          onAddMultiple={async (txs) => {
            const { data, error } = await supabase.from('transactions').insert(txs.map(t => ({ ...t, user_id: session?.user.id }))).select();
            if (!error && data) {
              setTransactions(prev => [...data, ...prev]);
              showToast(`${data.length} transações importadas com sucesso!`);
            } else if (error) {
              showToast('Erro ao salvar transações importadas', 'error');
            }
          }}
        />;

      case AppScreen.GOALS:
        return <Goals
          goals={goals}
          onOpenAddGoalModal={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
          onEdit={handleOpenEditGoal}
          onDelete={handleDeleteGoal}
          onAddContribution={handleOpenAddContribution}
          onViewHistory={(goal) => { setSelectedGoalForHistory(goal); setIsHistoryModalOpen(true); }}
        />;

      case AppScreen.INVESTMENTS:
        return <Investments
          investments={investments}
          dividends={dividends}
          onAddInvestment={handleAddInvestment}
          onEditInvestment={handleEditInvestment}
          onDeleteInvestment={handleDeleteInvestment}
          onAddDividend={handleAddDividend}
        />;
      case AppScreen.CALENDAR:
        return <Calendar
          recurringTransactions={recurringTransactions}
          transactions={transactions}
          creditCards={creditCards}
          onAddRecurringTransaction={handleAddRecurringTransaction}
          onEditRecurringTransaction={handleEditRecurringTransaction}
          onDeleteRecurringTransaction={handleDeleteRecurringTransaction}
          onPayBill={(billData) => {
            showConfirm(
              'Pagar Fatura',
              `Deseja confirmar o pagamento da fatura do cartão ${billData.cardName} no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(billData.amount)}?`,
              async () => {
                if (!session?.user.id) return;

                const { data, error } = await supabase
                  .from('transactions')
                  .insert([{
                    user_id: session.user.id,
                    description: `Fatura ${billData.cardName}`,
                    value: billData.amount,
                    type: 'expense',
                    category: 'Pagamento de Fatura',
                    date: new Date().toISOString().split('T')[0],
                    icon: 'credit_card',
                    is_bill_payment: true,
                    bill_card_brand: billData.cardName,
                    payment_method: 'Outros'
                  }])
                  .select();

                if (error) {
                  showToast('Erro ao realizar pagamento', 'error');
                  return;
                }

                if (data && data[0]) {
                  const newTx: Transaction = {
                    id: data[0].id,
                    date: data[0].date,
                    description: data[0].description,
                    category: data[0].category,
                    type: data[0].type,
                    value: data[0].value,
                    icon: data[0].icon,
                    paymentMethod: data[0].payment_method,
                    isBillPayment: true,
                    billCardBrand: data[0].bill_card_brand
                  };
                  setTransactions([newTx, ...transactions]);
                  showToast('Fatura paga com sucesso!');
                }
              },
              'success'
            );
          }}
        />;
      case AppScreen.PROFILE:
        return <Profile
          user={user}
          onSave={handleUpdateProfile}
          showToast={showToast}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />;
      case AppScreen.SETTINGS:
        return <Settings
          userId={session.user.id}
          showToast={showToast}
          useCustomCategories={useCustomCategories}
          onToggleCategoryMode={(useCustom) => setUseCustomCategories(useCustom)}
          transactions={transactions}
        />;
      default:
        return <Dashboard
          userName={user.name}
          transactions={transactions}
          goals={goals}
          investments={investments}
          goalContributions={goalContributions}
          onOpenAddTransactionModal={() => setIsModalOpen(true)}
          onViewAllTransactions={() => setCurrentScreen(AppScreen.TRANSACTIONS)}
        />;

    }
  };

  const getPageTitle = () => {
    switch (currentScreen) {
      case AppScreen.DASHBOARD: return 'Dashboard';
      case AppScreen.TRANSACTIONS: return 'Transações';
      case AppScreen.GOALS: return 'Minhas Metas';
      case AppScreen.PROFILE: return 'Meu Perfil';
      case AppScreen.INVESTMENTS: return 'Investimentos';
      case AppScreen.CALENDAR: return 'Calendário';
      case AppScreen.SETTINGS: return 'Configurações';
      default: return 'Granaup';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    if (showLanding) {
      return <LandingPage onNavigateToAuth={() => setShowLanding(false)} />;
    }
    return <Auth onSession={setSession} showToast={showToast} onBack={() => setShowLanding(true)} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
      <Sidebar currentScreen={currentScreen} setScreen={handleSetScreen} onLogout={handleLogout} isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 ${sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <Navbar
          setScreen={handleSetScreen}
          userAvatar={user.avatar}
          userName={user.name}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto pt-28 custom-scrollbar flex flex-col bg-background-light dark:bg-background-dark">
          <div className="w-full px-4 md:px-8 flex-1">
            <div className="max-w-6xl mx-auto pb-12">
              {renderScreen()}
            </div>
          </div>
          <Footer />
        </main>
      </div>


      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSave={handleAddTransaction}
        onSaveInvestment={handleAddInvestment}
        transactionToEdit={editingTransaction}
        categories={useCustomCategories ? categories : DEFAULT_CATEGORIES}
        creditCards={creditCards}
      />


      <AddGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => { setIsGoalModalOpen(false); setEditingGoal(null); }}
        onSave={handleSaveGoal}
        goalToEdit={editingGoal}
      />

      <AddContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => { setIsContributionModalOpen(false); setSelectedGoalForContribution(null); }}
        onConfirm={handleAddContribution}
        goalTitle={selectedGoalForContribution?.title || ''}
      />

      <GoalContributionsModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        goal={selectedGoalForHistory}
        onUpdate={fetchData}
        showConfirm={showConfirm}
        showToast={showToast}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        variant={confirmModal.variant}
        type={confirmModal.type}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div >
  );

};

export default App;
