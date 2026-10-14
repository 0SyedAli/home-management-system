import cron from 'node-cron';
import { CommitteeMember } from '../models/Committee';

/**
 * Reset committee monthly status for all active members to 'Pending'.
 * Runs on the 1st of every month at 00:00.
 * Also ensures an initialized paymentHistory record for currentMonthYear.
 */
export const resetMonthlyCommitteeStatus = async (): Promise<{ count: number; monthYear: string }> => {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  console.log(`[Monthly Reset] Checking and initializing committee status for ${currentMonthYear}...`);

  const members = await CommitteeMember.find();
  let updatedCount = 0;

  for (const member of members) {
    if (!member.paymentHistory) {
      member.paymentHistory = [];
    }

    const currentRecord = member.paymentHistory.find((p) => p.monthYear === currentMonthYear);

    // If no record exists for this month, create one as Pending and reset current status
    if (!currentRecord) {
      member.paymentHistory.push({
        monthYear: currentMonthYear,
        status: 'Pending',
        amountPaid: 0,
      });
      member.status = 'Pending';
      await member.save();
      updatedCount++;
    }
  }

  console.log(`[Monthly Reset] Processed ${members.length} members. ${updatedCount} newly initialized for ${currentMonthYear}.`);
  return { count: members.length, monthYear: currentMonthYear };
};

/**
 * Initialize background cron jobs
 */
export const initCronJobs = () => {
  // 0 0 1 * * -> At 00:00 on day-of-month 1
  cron.schedule('0 0 1 * *', async () => {
    try {
      console.log('[Cron Trigger] 1st of the month reached - resetting all committee members to Pending...');
      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Reset all members to Pending for the new month cycle
      const members = await CommitteeMember.find();
      for (const member of members) {
        member.status = 'Pending';
        if (!member.paymentHistory) member.paymentHistory = [];
        
        const existing = member.paymentHistory.find((p) => p.monthYear === currentMonthYear);
        if (!existing) {
          member.paymentHistory.push({
            monthYear: currentMonthYear,
            status: 'Pending',
            amountPaid: 0,
          });
        } else {
          existing.status = 'Pending';
        }
        await member.save();
      }
      console.log(`[Cron Trigger] Successfully reset ${members.length} committee members to Pending for ${currentMonthYear}.`);
    } catch (err: any) {
      console.error('[Cron Trigger] Failed to execute monthly reset:', err.message);
    }
  });

  console.log('Cron scheduler active: Committee monthly reset configured for 0 0 1 * * (1st of every month).');
};
