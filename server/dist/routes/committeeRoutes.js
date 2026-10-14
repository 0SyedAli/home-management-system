"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Committee_1 = require("../models/Committee");
const cronService_1 = require("../services/cronService");
const router = (0, express_1.Router)();
// Helper: current month formatted as YYYY-MM
const getCurrentMonthYear = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
// Helper: format member and evaluate fallback current month status
const formatMemberWithMonthStatus = (m, currentMonthYear) => {
    const obj = m.toObject ? m.toObject() : m;
    const history = obj.paymentHistory || [];
    const currentRecord = history.find((p) => p.monthYear === currentMonthYear);
    let currentStatus = 'Pending';
    let amountPaid = 0;
    let remainingDue = obj.monthlyInstallment || 0;
    let notes = obj.notes || '';
    if (currentRecord) {
        currentStatus = currentRecord.status;
        amountPaid = currentRecord.amountPaid || 0;
        remainingDue = currentRecord.remainingDue !== undefined ? currentRecord.remainingDue : Math.max(0, (obj.monthlyInstallment || 0) - amountPaid);
        notes = currentRecord.notes || notes;
    }
    else if (obj.status) {
        currentStatus = obj.status;
        amountPaid = currentStatus === 'Paid' ? (obj.monthlyInstallment || 0) : (obj.currentMonthPaidAmount || 0);
        remainingDue = Math.max(0, (obj.monthlyInstallment || 0) - amountPaid);
    }
    return {
        ...obj,
        id: obj._id ? obj._id.toString() : obj.id,
        _id: obj._id ? obj._id.toString() : obj.id,
        name: obj.memberName || obj.name,
        status: currentStatus,
        currentMonthPaidAmount: amountPaid,
        currentMonthRemainingDue: remainingDue,
        notes,
        currentMonthYear,
    };
};
// GET /api/committees/members - Get all committee members with fallback month status
router.get('/members', async (_req, res) => {
    try {
        const currentMonthYear = getCurrentMonthYear();
        const members = await Committee_1.CommitteeMember.find().sort({ createdAt: -1 });
        const formatted = members.map((m) => formatMemberWithMonthStatus(m, currentMonthYear));
        res.json({ success: true, count: formatted.length, currentMonthYear, data: formatted });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST /api/committees/members - Add new committee participant
router.post('/members', async (req, res) => {
    try {
        const { name, memberName, monthlyInstallment, startDate, endDate, payoutMonth, notes } = req.body;
        const finalName = (name || memberName || '').trim();
        if (!finalName) {
            return res.status(400).json({ success: false, message: 'Member name is required' });
        }
        const currentMonthYear = getCurrentMonthYear();
        const start = startDate || currentMonthYear;
        const end = endDate || '';
        // Validate that End Date is after Start Date
        if (start && end && end <= start) {
            return res.status(400).json({ success: false, message: 'End Date must be after Start Date' });
        }
        const installment = Number(monthlyInstallment) || 0;
        const member = await Committee_1.CommitteeMember.create({
            memberName: finalName,
            monthlyInstallment: installment,
            startDate: start,
            endDate: end,
            payoutMonth: payoutMonth || 'Not Specified',
            status: 'Pending',
            currentMonthPaidAmount: 0,
            currentMonthRemainingDue: installment,
            paymentHistory: [
                {
                    monthYear: currentMonthYear,
                    status: 'Pending',
                    amountPaid: 0,
                    remainingDue: installment,
                },
            ],
            notes,
        });
        const formatted = formatMemberWithMonthStatus(member, currentMonthYear);
        res.status(201).json({ success: true, data: formatted });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// PUT /api/committees/members/:id - Update/Edit committee participant details
router.put('/members/:id', async (req, res) => {
    try {
        const { name, memberName, monthlyInstallment, startDate, endDate, payoutMonth, notes } = req.body;
        const member = await Committee_1.CommitteeMember.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        if (name || memberName)
            member.memberName = (name || memberName).trim();
        if (monthlyInstallment !== undefined)
            member.monthlyInstallment = Number(monthlyInstallment);
        if (startDate)
            member.startDate = startDate;
        if (endDate)
            member.endDate = endDate;
        if (payoutMonth)
            member.payoutMonth = payoutMonth.trim();
        if (notes !== undefined)
            member.notes = notes;
        if (member.startDate && member.endDate && member.endDate <= member.startDate) {
            return res.status(400).json({ success: false, message: 'End Date must be after Start Date' });
        }
        await member.save();
        const currentMonthYear = getCurrentMonthYear();
        const formatted = formatMemberWithMonthStatus(member, currentMonthYear);
        res.json({ success: true, message: 'Member details updated successfully', data: formatted });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// PATCH / PUT /api/committees/members/:id/status - Update member payment (Full, Partial, Pending)
const updateMemberStatusHandler = async (req, res) => {
    try {
        const { status, amountPaid, notes, monthYear } = req.body;
        const targetMonthYear = monthYear || getCurrentMonthYear();
        const member = await Committee_1.CommitteeMember.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        let nextStatus;
        let paidAmt = 0;
        let remDue = member.monthlyInstallment;
        if (amountPaid !== undefined && amountPaid !== '') {
            paidAmt = Number(amountPaid) || 0;
            if (paidAmt >= member.monthlyInstallment) {
                nextStatus = 'Paid';
                paidAmt = member.monthlyInstallment;
                remDue = 0;
            }
            else if (paidAmt > 0) {
                nextStatus = 'Partial';
                remDue = Math.max(0, member.monthlyInstallment - paidAmt);
            }
            else {
                nextStatus = 'Pending';
                paidAmt = 0;
                remDue = member.monthlyInstallment;
            }
        }
        else if (status) {
            nextStatus = status;
            if (nextStatus === 'Paid') {
                paidAmt = member.monthlyInstallment;
                remDue = 0;
            }
            else if (nextStatus === 'Partial') {
                paidAmt = member.currentMonthPaidAmount || Math.round(member.monthlyInstallment / 2);
                remDue = Math.max(0, member.monthlyInstallment - paidAmt);
            }
            else {
                paidAmt = 0;
                remDue = member.monthlyInstallment;
            }
        }
        else {
            nextStatus = member.status === 'Paid' ? 'Pending' : 'Paid';
            paidAmt = nextStatus === 'Paid' ? member.monthlyInstallment : 0;
            remDue = nextStatus === 'Paid' ? 0 : member.monthlyInstallment;
        }
        member.status = nextStatus;
        member.currentMonthPaidAmount = paidAmt;
        member.currentMonthRemainingDue = remDue;
        if (!member.paymentHistory) {
            member.paymentHistory = [];
        }
        const recordIndex = member.paymentHistory.findIndex((p) => p.monthYear === targetMonthYear);
        const paymentEntry = {
            monthYear: targetMonthYear,
            status: nextStatus,
            paidDate: nextStatus !== 'Pending' ? new Date() : undefined,
            amountPaid: paidAmt,
            remainingDue: remDue,
            notes: notes !== undefined ? notes : (recordIndex !== -1 ? member.paymentHistory[recordIndex].notes : ''),
        };
        if (recordIndex !== -1) {
            member.paymentHistory[recordIndex] = paymentEntry;
        }
        else {
            member.paymentHistory.push(paymentEntry);
        }
        await member.save();
        const formatted = formatMemberWithMonthStatus(member, targetMonthYear);
        res.json({ success: true, message: `Payment updated: ${nextStatus} (Paid: Rs ${paidAmt})`, data: formatted });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
router.patch('/members/:id/status', updateMemberStatusHandler);
router.put('/members/:id/status', updateMemberStatusHandler);
// DELETE /api/committees/members/:id - Remove member
router.delete('/members/:id', async (req, res) => {
    try {
        const member = await Committee_1.CommitteeMember.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        res.json({ success: true, message: 'Member deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// POST /api/committees/reset-monthly - Manual trigger for monthly reset
router.post('/reset-monthly', async (_req, res) => {
    try {
        const result = await (0, cronService_1.resetMonthlyCommitteeStatus)();
        res.json({ success: true, message: 'Monthly reset triggered successfully', ...result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET all committees with member summary
router.get('/', async (_req, res) => {
    try {
        const committees = await Committee_1.Committee.find().sort({ startDate: -1 });
        const currentMonthYear = getCurrentMonthYear();
        const committeesWithDetails = await Promise.all(committees.map(async (c) => {
            const members = await Committee_1.CommitteeMember.find({ committeeId: c._id }).sort({ payoutMonthIndex: 1 });
            return {
                ...c.toObject(),
                memberCount: members.length,
                members: members.map((m) => formatMemberWithMonthStatus(m, currentMonthYear)),
            };
        }));
        res.json({ success: true, count: committees.length, data: committeesWithDetails });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET single committee with members
router.get('/:id', async (req, res) => {
    try {
        const committee = await Committee_1.Committee.findById(req.params.id);
        if (!committee) {
            return res.status(404).json({ success: false, message: 'Committee not found' });
        }
        const members = await Committee_1.CommitteeMember.find({ committeeId: committee._id }).sort({
            payoutMonthIndex: 1,
        });
        res.json({
            success: true,
            data: {
                committee,
                members,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST create committee
router.post('/', async (req, res) => {
    try {
        const { name, description, startDate, totalMonths, organizerName, notes } = req.body;
        const start = new Date(startDate || Date.now());
        const end = new Date(start);
        end.setMonth(end.getMonth() + Number(totalMonths || 10));
        const committee = await Committee_1.Committee.create({
            name,
            description,
            monthlyPoolTotal: 0,
            totalPoolLifecycleValue: 0,
            startDate: start,
            endDate: end,
            totalMonths: Number(totalMonths || 10),
            organizerName: organizerName || 'Self / Household',
            notes,
        });
        res.status(201).json({ success: true, data: committee });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// POST add member to committee
router.post('/:id/members', async (req, res) => {
    try {
        const committee = await Committee_1.Committee.findById(req.params.id);
        if (!committee) {
            return res.status(404).json({ success: false, message: 'Committee not found' });
        }
        const { memberName, phone, monthlyInstallment, payoutMonthIndex, notes } = req.body;
        const payoutDate = new Date(committee.startDate);
        payoutDate.setMonth(payoutDate.getMonth() + (Number(payoutMonthIndex) - 1));
        // Initialize contributions for all committee months
        const contributions = [];
        for (let i = 1; i <= committee.totalMonths; i++) {
            const due = new Date(committee.startDate);
            due.setMonth(due.getMonth() + (i - 1));
            due.setDate(5); // 5th of each month
            const cycleLabel = due.toLocaleString('default', { month: 'short', year: 'numeric' });
            contributions.push({
                monthIndex: i,
                cycleLabel,
                year: due.getFullYear(),
                month: due.getMonth() + 1,
                dueDate: due,
                amountDue: Number(monthlyInstallment),
                amountPaid: 0,
                status: 'Pending',
            });
        }
        const member = await Committee_1.CommitteeMember.create({
            committeeId: committee._id,
            memberName,
            phone,
            monthlyInstallment: Number(monthlyInstallment),
            payoutMonthIndex: Number(payoutMonthIndex),
            scheduledPayoutDate: payoutDate,
            payoutAmount: committee.monthlyPoolTotal + Number(monthlyInstallment), // or full monthly pool
            contributions,
            notes,
        });
        // Recalculate committee pool total
        const allMembers = await Committee_1.CommitteeMember.find({ committeeId: committee._id });
        const newMonthlyPool = allMembers.reduce((acc, m) => acc + m.monthlyInstallment, 0);
        committee.monthlyPoolTotal = newMonthlyPool;
        committee.totalPoolLifecycleValue = newMonthlyPool * committee.totalMonths;
        await committee.save();
        res.status(201).json({ success: true, data: member });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// PUT toggle or update member monthly contribution status
router.put('/members/:memberId/contribution', async (req, res) => {
    try {
        const { monthIndex, status, amountPaid, paymentMethod } = req.body;
        const member = await Committee_1.CommitteeMember.findById(req.params.memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        const contribution = member.contributions.find((c) => c.monthIndex === Number(monthIndex));
        if (!contribution) {
            return res.status(404).json({ success: false, message: 'Contribution month not found' });
        }
        contribution.status = status;
        if (status === 'Paid') {
            contribution.amountPaid = amountPaid !== undefined ? Number(amountPaid) : contribution.amountDue;
            contribution.paidDate = new Date();
            if (paymentMethod)
                contribution.paymentMethod = paymentMethod;
        }
        else {
            contribution.amountPaid = 0;
            contribution.paidDate = undefined;
        }
        member.totalContributedToDate = member.contributions.reduce((acc, c) => acc + (c.amountPaid || 0), 0);
        await member.save();
        res.json({ success: true, data: member });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// PUT mark payout completed / toggled
router.put('/members/:memberId/payout', async (req, res) => {
    try {
        const { isPayoutCompleted, actualPayoutDate, notes } = req.body;
        const member = await Committee_1.CommitteeMember.findById(req.params.memberId);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        member.isPayoutCompleted = Boolean(isPayoutCompleted);
        member.actualPayoutDate = isPayoutCompleted ? (actualPayoutDate ? new Date(actualPayoutDate) : new Date()) : undefined;
        if (notes)
            member.notes = notes;
        await member.save();
        res.json({ success: true, data: member });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
exports.default = router;
