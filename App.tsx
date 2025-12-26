
import React, { useState, useEffect } from 'react';
import { AppScreen, Transaction, Goal, Investment, UserProfile, GoalContribution, Dividend } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Investments from './components/Investments';
import Transactions from './components/Transactions';
import Goals from './components/Goals';
import Profile from './components/Profile';
import AddTransactionModal from './components/AddTransactionModal';
import AddGoalModal from './components/AddGoalModal';
import AddContributionModal from './components/AddContributionModal';
import Auth from './components/Auth';
import GoalContributionsModal from './components/GoalContributionsModal';


import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.DASHBOARD);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
        const fullName = session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Usuário';
        const firstName = fullName.split(' ')[0];
        setUser(prev => ({
          ...prev,
          name: firstName,
          email: session.user.email || '',
        }));
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const fullName = session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Usuário';
        const firstName = fullName.split(' ')[0];
        setUser(prev => ({
          ...prev,
          name: firstName,
          email: session.user.email || '',
        }));
      }

    });

    return () => subscription.unsubscribe();
  }, []);

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
        type: tx.type as 'income' | 'expense',
        value: Number(tx.value),
        icon: tx.icon,
        paymentMethod: tx.payment_method,
        installments: tx.installments
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
        icon: inv.icon
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
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: updatedProfile.name }
      });
      if (error) throw error;
      setUser(updatedProfile);
      alert('Perfil atualizado com sucesso!');
    } catch (err: any) {
      alert('Erro ao atualizar perfil: ' + err.message);
    }
  };

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      await supabase.auth.signOut();
    }
  };




  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goalContributions, setGoalContributions] = useState<GoalContribution[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);


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
          installments: newTransaction.installments
        })
        .eq('id', editingTransaction.id);

      if (error) {
        alert('Erro ao atualizar transação: ' + error.message);
        return;
      }

      setTransactions(transactions.map(tx => tx.id === editingTransaction.id ? { ...newTransaction, id: editingTransaction.id } : tx));
      setEditingTransaction(null);
    } else {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: session.user.id,
          date: newTransaction.date,
          description: newTransaction.description,
          category: newTransaction.category,
          type: newTransaction.type,
          value: newTransaction.value,
          icon: newTransaction.icon,
          payment_method: newTransaction.paymentMethod,
          installments: newTransaction.installments
        }])
        .select();

      if (error) {
        alert('Erro ao salvar transação: ' + error.message);
        return;
      }

      if (data) {
        const savedTx = data[0];
        const transactionWithId: Transaction = {
          ...newTransaction,
          id: savedTx.id,
        };
        setTransactions([transactionWithId, ...transactions]);
      }
    }
    setIsModalOpen(false);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Deseja realmente excluir esta transação?')) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Erro ao excluir transação: ' + error.message);
        return;
      }

      setTransactions(transactions.filter(tx => tx.id !== id));
    }
  };


  const handleSaveGoal = async (goalData: Omit<Goal, 'id' | 'currentValue' | 'status'>) => {
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
          monthly_contribution: goalData.monthlyContribution
        })
        .eq('id', editingGoal.id);

      if (error) {
        alert('Erro ao atualizar meta: ' + error.message);
        return;
      }

      setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
      setEditingGoal(null);
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
          monthly_contribution: goalData.monthlyContribution
        }])
        .select();

      if (error) {
        alert('Erro ao salvar meta: ' + error.message);
        return;
      }

      if (data) {
        const savedGoal = data[0];
        const goalWithId: Goal = {
          ...goalData,
          id: savedGoal.id,
          currentValue: 0,
          status: 'Iniciado',
        };
        setGoals([...goals, goalWithId]);
      }
    }
    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Erro ao excluir meta: ' + error.message);
        return;
      }

      setGoals(goals.filter(g => g.id !== id));
    }
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
      const newCurrentValue = selectedGoalForContribution.currentValue + amount;
      const isCompleted = newCurrentValue >= selectedGoalForContribution.targetValue;
      const completionDate = isCompleted && !selectedGoalForContribution.completionDate ? date : (isCompleted ? selectedGoalForContribution.completionDate : null);

      // 1. Insert into history
      const { error: historyError } = await supabase
        .from('goal_contributions')
        .insert([{
          goal_id: selectedGoalForContribution.id,
          user_id: session.user.id,
          amount: amount,
          date: date
        }]);

      if (historyError) {
        alert('Erro ao salvar histórico do aporte: ' + historyError.message);
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
        alert('Erro ao salvar contribuição na meta: ' + error.message);
        return;
      }

      setGoals(goals.map(g => {
        if (g.id === selectedGoalForContribution.id) {
          return {
            ...g,
            currentValue: newCurrentValue,
            lastContributionDate: date,
            completionDate: completionDate || undefined
          };
        }
        return g;
      }));
      setIsContributionModalOpen(false);
      setSelectedGoalForContribution(null);
    }
  };


  const handleAddInvestment = async (investmentData: Omit<Investment, 'id'>) => {
    if (!session?.user.id) return;

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
      alert('Erro ao salvar investimento: ' + error.message);
      return;
    }

    if (data) {
      const savedInv = data[0];
      const investmentWithId: Investment = {
        ...investmentData,
        id: savedInv.id,
      };
      setInvestments([...investments, investmentWithId]);
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
      alert('Erro ao atualizar investimento: ' + error.message);
      return;
    }

    setInvestments(investments.map(inv =>
      inv.id === id ? { ...investmentData, id } : inv
    ));
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
      alert('Erro ao salvar dividendo: ' + error.message);
      return;
    }

    if (data) {
      setDividends([{
        id: data[0].id,
        investmentId: data[0].investment_id,
        assetName: data[0].asset_name,
        value: Number(data[0].value),
        date: data[0].date
      }, ...dividends]);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Erro ao excluir investimento: ' + error.message);
        return;
      }

      setInvestments(investments.filter(inv => inv.id !== id));
    }
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
          onOpenAddTransactionModal={() => setIsModalOpen(true)}
          onViewAllTransactions={() => setCurrentScreen(AppScreen.TRANSACTIONS)}
        />;
      case AppScreen.TRANSACTIONS:
        return <Transactions
          transactions={transactions}
          onOpenAddTransactionModal={() => { setEditingTransaction(null); setIsModalOpen(true); }}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
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
      case AppScreen.PROFILE:
        return <Profile user={user} onSave={handleUpdateProfile} />;
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
    return <Auth onSession={setSession} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
      <Sidebar currentScreen={currentScreen} setScreen={setCurrentScreen} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative md:pl-36">
        <Navbar
          setScreen={setCurrentScreen}
          userAvatar={user.avatar}
          userName={user.name}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-32 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-12">
            {renderScreen()}
          </div>

          <footer className="mt-12 text-center text-slate-400 text-sm pb-8">
            <p>© 2023 Granaup. Feito com ❤️ para o seu futuro.</p>
          </footer>
        </main>
      </div>


      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSave={handleAddTransaction}
        transactionToEdit={editingTransaction}
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
      />

    </div >
  );

};

export default App;
