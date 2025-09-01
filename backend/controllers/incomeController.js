const xlsx = require("xlsx");
const Income = require("../models/Income");

// Add Income Source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const { icon, source, amount, date } = req.body;
        if (!source || !amount || !date) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        });

        await newIncome.save();
        res.status(201).json(newIncome);
    } catch (error) {
        res.status(500).json({ message: "Error while adding income", error: error.message });
    }
}

// Get All Income Source
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;
    try {
        const incomes = await Income.find({ userId }).sort({ date: -1 });
        res.status(200).json(incomes);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        await Income.findOneAndDelete(req.params.id);
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// download Excel
exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const incomes = await Income.find({ userId }).sort({ date: -1 });

        //prepare data for excel
        const excelData = incomes.map((item)=>({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toISOString().split('T')[0], //format date as YYYY-MM-DD
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(excelData);
        xlsx.utils.book_append_sheet(wb, ws, "Incomes");
        xlsx.writeFile(wb, "income_details.xlsx");
        res.download("income_details.xlsx");
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};