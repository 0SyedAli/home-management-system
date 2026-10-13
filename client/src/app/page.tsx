'use client';

import React from 'react';
import { KPICards } from '../components/KPICards';
import { RentCollectionCard } from '../components/RentCollectionCard';
import { RecentHouseholdExpensesCard } from '../components/RecentHouseholdExpensesCard';
import { MonthlyCommitteeCard } from '../components/MonthlyCommitteeCard';
import { IncomeVsExpensesCard } from '../components/IncomeVsExpensesCard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <KPICards />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (~62% width: cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          <RentCollectionCard />
          <RecentHouseholdExpensesCard />
        </div>

        {/* Right Column (~38% width: cols 5) */}
        <div className="lg:col-span-5 space-y-6">
          <MonthlyCommitteeCard />
          <IncomeVsExpensesCard />
        </div>
      </div>
    </div>
  );
}
