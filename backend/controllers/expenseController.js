const xlsx= require("xlsx");
const Expense = require("../models/Expense");
exports.addExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, category, amount, date } = req.body;
    if (!category || !amount || !date) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    const newExpense = new Expense({ userId, icon, category, amount, date });
    await newExpense.save();
    res
      .status(201)
      .json({ message: "Expense added successfully", expense: newExpense });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json({ expense });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    await Expense.findByIdAndDelete(expenseId);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    if (expense.length === 0) {
      return res.status(404).json({ message: "No expense data found to download" });
    }

    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: new Date(item.date).toLocaleDateString(), 
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");
    
    // 1. Generate buffer in memory (avoid writing to disk)
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 2. Set headers to tell the browser this is a file download
    res.setHeader('Content-Disposition', 'attachment; filename=ExpenseData.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', buffer.length);

    // 3. Send the binary data directly
    res.send(buffer);

  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// exports.downloadExpenseExcel = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     const expense = await Expense.find({ userId }).sort({ date: -1 });
//     if (expense.length === 0) {
//       return res.status(404).json({ message: "No expense data found to download" });
//     }
//     const data = expense.map((item) => ({
//       Category: item.category,
//       Amount: item.amount,
//       Date: item.date,
//     }));
//     const wb = xlsx.utils.book_new();
//     const ws = xlsx.utils.json_to_sheet(data);
//     xlsx.utils.book_append_sheet(wb, ws, "Expense");


//     xlsx.writeFile(wb, "ExpenseData.xlsx");
//     res.download("ExpenseData.xlsx");
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
