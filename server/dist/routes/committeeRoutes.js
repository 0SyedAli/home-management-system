"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Committee_1 = require("../models/Committee");
const router = (0, express_1.Router)();
// GET all committees with member summary
router.get('/', async (_req, res) => {
    try {
        const committees = await Committee_1.Committee.find().sort({ startDate: -1 });
        const committeesWithDetails = await Promise.all(committees.map(async (c) => {
            const members = await Committee_1.CommitteeMember.find({ committeeId: c._id }).sort({ payoutMonthIndex: 1 });
            return {
                ...c.toObject(),
                memberCount: members.length,
                members,
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
