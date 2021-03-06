/**
 ** Controllers for Expense Tracker
 * @author Andrew Joel
 * @description Contains all modules required for running the expense tracker
 * @version 1.0
 ** Uses Revealing Module Design Pattern
 */

const StorageController = (function() {
	const storeExpenseInStorage = function(expense) {
		let expenses = [];
		if (localStorage.getItem("expenses") === null) {
			expenses = [];
			expenses.push(expense);
			localStorage.setItem("expenses", JSON.stringify(expenses));
		} else {
			expenses = JSON.parse(localStorage.getItem("expenses"));
			expenses.push(expense);
			localStorage.setItem("expenses", JSON.stringify(expenses));
		}
	};

	const fetchExpensesFromStorage = function() {
		let expenses;
		if (localStorage.getItem("expenses") === null) expenses = [];
		else expenses = JSON.parse(localStorage.getItem("expenses"));
		return expenses;
	};

	const removeExpenseFromStorage = function() {
		if (localStorage.getItem("expenses")) localStorage.removeItem("expenses");
	};

	const updateStoredExpense = function(updatedExpense) {
		let expensesList;
		if (localStorage.getItem("expenses") !== null) {
			expensesList = JSON.parse(localStorage.getItem("expenses"));
			expensesList.forEach(function(expense, index) {
				if (expense.id === updatedExpense.id) {
					expensesList.splice(index, 1, updatedExpense);
				}
			});
			localStorage.setItem("expenses", JSON.stringify(expensesList));
		}
	};

	const deleteExpenseFromStorage = function(id) {
		let expensesList;

		expensesList = JSON.parse(localStorage.getItem("expenses"));

		expensesList.forEach(function(expense, index) {
			if (expense.id === id) expensesList.splice(index, 1);
		});
		localStorage.setItem("expenses", JSON.stringify(expensesList));
	};

	return {
		storeExpenseInStorage: storeExpenseInStorage,
		fetchExpensesFromStorage: fetchExpensesFromStorage,
		removeExpenseFromStorage: removeExpenseFromStorage,
		updateStoredExpense: updateStoredExpense,
		deleteExpenseFromStorage: deleteExpenseFromStorage
	};
})();

const ItemController = (function(StorageController) {
	const Item = function(id, expenseName, expenseCost, expenseDate) {
		this.id = id;
		this.expenseName = expenseName;
		this.expenseCost = expenseCost;
		this.expenseDate = expenseDate;
	};

	const expenseState = {
		expenses: StorageController.fetchExpensesFromStorage(),
		currentExpense: null,
		totalExpense: 0
	};

	const addNewExpense = function(expenseName, expenseCost) {
		let newExpense = new Item(
			generateExpenseID(),
			expenseName,
			parseInt(expenseCost),
			generateTimestamp()
		);
		expenseState.expenses.push(newExpense);
		return newExpense;
	};

	const getItems = function() {
		return expenseState.expenses;
	};

	const logData = function() {
		console.log(expenseState);
	};

	const generateExpenseID = function() {
		let id;
		if (expenseState.expenses.length > 0) {
			id = expenseState.expenses[expenseState.expenses.length - 1].id + 1;
		} else {
			id = 0;
		}
		return id;
	};

	const generateTimestamp = function() {
		let date = new Date();
		return `Date: ${date.getDate()}/${date.getUTCMonth() +
			1}/${date.getFullYear()}, Time: ${date.getHours()}:${date.getMinutes()}`;
	};

	const computeTotalExpense = function() {
		let total = 0;
		if (expenseState.expenses.length > 0)
			expenseState.expenses.forEach(function(expense) {
				total += expense.expenseCost;
			});
		expenseState.totalExpense = total;
		return total;
	};

	const getExpenseByID = function(id) {
		let found = null;
		expenseState.expenses.forEach(function(expense) {
			if (expense.id === id) found = expense;
		});
		return found;
	};

	const setCurrentExpense = function(expense) {
		expenseState.currentExpense = expense;
	};

	const getCurrentExpense = function() {
		return expenseState.currentExpense;
	};

	const updateExpense = function(name, cost) {
		cost = parseInt(cost);
		let found;

		expenseState.expenses.forEach(function(expense) {
			if (expense.id === expenseState.currentExpense.id) {
				expense.expenseName = name;
				expense.expenseCost = cost;
				expense.expenseDate = generateTimestamp();
				found = expense;
				``;
			}
		});
		return found;
	};

	const clearExpenses = function() {
		expenseState.currentExpense = null;
		expenseState.totalExpense = 0;
		expenseState.expenses = [];
		StorageController.removeExpenseFromStorage();
	};

	const deleteCurrentExpense = function(id) {
		let ids = expenseState.expenses.map(function(expense) {
			return expense.id;
		});

		let index = ids.indexOf(id);
		expenseState.expenses.splice(index, 1);
	};

	return {
		logData: logData,
		getExpenses: getItems,
		addNewExpense: addNewExpense,
		computeTotalExpense: computeTotalExpense,
		getExpenseByID: getExpenseByID,
		setCurrentExpense: setCurrentExpense,
		getCurrentExpense: getCurrentExpense,
		updateExpense: updateExpense,
		clearExpenses: clearExpenses,
		deleteCurrentExpense: deleteCurrentExpense
	};
})(StorageController);

const UIController = (function() {
	const UISelectors = {
		expenseList: "#expense-list",
		btnAddExpense: ".add-btn",
		btnUpdateExpense: ".update-btn",
		btnBack: ".back-btn",
		btnClear: ".clear-btn",
		ipExpenseName: "#expense-name",
		ipExpenseCost: "#expense-cost",
		showTotalExpense: ".total-expense"
	};

	const changeState = function(state) {
		if (state === "home") homeState();
		else if (state === "edit") editState();
	};

	const homeState = function() {
		document.querySelector(UISelectors.btnAddExpense).style.display =
			"inline-block";
		document.querySelector(UISelectors.btnUpdateExpense).style.display = "none";
		document.querySelector(UISelectors.btnBack).style.display = "none";
		clearFields();
	};

	const editState = function() {
		document.querySelector(UISelectors.btnAddExpense).style.display = "none";
		document.querySelector(UISelectors.btnUpdateExpense).style.display =
			"inline-block";
		document.querySelector(UISelectors.btnBack).style.display = "inline-block";
	};

	const generateExpenses = function(expenses) {
		let expenseHTML = "";
		if (expenses.length > 0) {
			expenses.forEach(function(expense) {
				expenseHTML += `
				<li class="collection-item" id="expense-${expense.id}">
					<b>${expense.expenseName} Rs. ${expense.expenseCost}</b> <br />
          <em>${expense.expenseDate}</em>
					<a href="#" class="secondary-content">
						<i class="material-icons red-text white delete-expense">delete</i>
					</a>
					<a href="#" class="secondary-content">
						<i class="material-icons blue-text white edit-expense">mode_edit</i>
          </a>
				</li>
      `;
			});
			document.querySelector(UISelectors.expenseList).innerHTML = expenseHTML;
			document.querySelector(UISelectors.btnClear).style.display =
				"inline-block";
		} else {
			expenseHTML = `<li class="collection-item"><em>No expenses present. Add an expense</em></li>`;
			document.querySelector(UISelectors.expenseList).innerHTML = expenseHTML;
			document.querySelector(UISelectors.btnClear).style.display = "none";
		}
	};

	const clearFields = function() {
		document.querySelector(UISelectors.ipExpenseName).value = "";
		document.querySelector(UISelectors.ipExpenseCost).value = "";
	};

	const getFields = function() {
		return {
			expenseName: document.querySelector(UISelectors.ipExpenseName).value,
			expenseCost: document.querySelector(UISelectors.ipExpenseCost).value
		};
	};

	const showToast = function(message) {
		M.toast({
			html: `${message}`,
			displayLength: 2000,
			inDuration: 300,
			outDuration: 300,
			activationPercent: 0.8
		});
	};

	const displayTotalExpense = function(total) {
		document.querySelector(UISelectors.showTotalExpense).innerHTML = total;
	};

	const fillFields = function() {
		document.querySelector(
			UISelectors.ipExpenseName
		).value = ItemController.getCurrentExpense().expenseName;
		document.querySelector(
			UISelectors.ipExpenseCost
		).value = ItemController.getCurrentExpense().expenseCost;
	};

	return {
		UISelectors: UISelectors,
		changeState: changeState,
		generateExpenses: generateExpenses,
		displayTotalExpense: displayTotalExpense,
		clearFields: clearFields,
		fillFields: fillFields,
		getFields: getFields,
		showToast: showToast
	};
})();

const AppController = (function(
	ItemController,
	UIController,
	StorageController
) {
	const loadEventListeners = function() {
		document
			.querySelector(UIController.UISelectors.btnAddExpense)
			.addEventListener("click", submitExpense);

		document
			.querySelector(UIController.UISelectors.expenseList)
			.addEventListener("click", editExpense);

		document
			.querySelector(UIController.UISelectors.btnBack)
			.addEventListener("click", function(e) {
				UIController.changeState("home");
				e.preventDefault();
			});

		document
			.querySelector(UIController.UISelectors.btnUpdateExpense)
			.addEventListener("click", updateEditExpense);

		document
			.querySelector(UIController.UISelectors.expenseList)
			.addEventListener("click", deleteExpense);

		document.addEventListener("keypress", function(e) {
			if (e.keyCode === 13 || e.which === 13) {
				e.preventDefault();
				return false;
			}
		});

		document
			.querySelector(UIController.UISelectors.btnClear)
			.addEventListener("click", clearAllExpenses);
	};

	const updateTotalExpense = function() {
		let total = ItemController.computeTotalExpense();
		UIController.displayTotalExpense(total);
	};

	const editExpense = function(e) {
		if (e.target.classList.contains("edit-expense")) {
			UIController.changeState("edit");
			let currentID = e.target.parentNode.parentNode.id;
			let currentExpenseID = parseInt(currentID.slice(-1));
			let currentExpense = ItemController.getExpenseByID(currentExpenseID);
			ItemController.setCurrentExpense(currentExpense);
			UIController.fillFields();
		}
		e.preventDefault();
	};

	const updateEditExpense = function(e) {
		e.preventDefault();
		let updatedExpenseName = UIController.getFields().expenseName;
		let updatedExpenseCost = UIController.getFields().expenseCost;
		let updatedExpense = ItemController.updateExpense(
			updatedExpenseName,
			updatedExpenseCost
		);
		StorageController.updateStoredExpense(updatedExpense);
		UIController.showToast("Expense Updated!");
		init();
	};

	const deleteExpense = function(e) {
		e.preventDefault();
		if (e.target.classList.contains("delete-expense")) {
			if (confirm("Are you sure you want to delete?")) {
				let currentID = e.target.parentNode.parentNode.id;
				let currentExpenseID = parseInt(currentID.slice(-1));
				StorageController.deleteExpenseFromStorage(currentExpenseID);
				ItemController.deleteCurrentExpense(currentExpenseID);
				UIController.showToast("Expense deleted!");
				init();
			}
		}
	};

	const init = function() {
		UIController.changeState("home");
		const expenses = ItemController.getExpenses();
		UIController.generateExpenses(expenses);
		updateTotalExpense();
		loadEventListeners();
	};

	const submitExpense = function(e) {
		let expenseName = UIController.getFields().expenseName;
		let expenseCost = UIController.getFields().expenseCost;

		if (expenseName !== "" && expenseCost != "") {
			let newExpense = ItemController.addNewExpense(expenseName, expenseCost);
			StorageController.storeExpenseInStorage(newExpense);
			UIController.showToast("Expense added!");
			init();
		} else {
			UIController.showToast("Expense is empty");
		}
		e.preventDefault();
	};

	const clearAllExpenses = function(e) {
		e.preventDefault();
		if (confirm("Are you sure you want to clear all expenses?")) {
			UIController.showToast("All expenses cleared");
			ItemController.clearExpenses();
			init();
		}
	};

	return {
		init: init
	};
})(ItemController, UIController, StorageController);

AppController.init();
