// -- >  Storage CONTROLLER
const StorageCtrl = (function () {
	return {
		storeItem: function (item) {
			let items;
			//Check if any items in LS
			if (localStorage.getItem('items') === null) {
				items = [];
				items.push(item);
				//Set LS
				localStorage.setItem('items', JSON.stringify(items));
			} else {
				//Get data from LS if exists
				items = JSON.parse(localStorage.getItem('items'));

				//Push new item
				items.push(item);

				//Reset LS
				localStorage.setItem('items', JSON.stringify(items));
			}
		},
		getItemsFromLS: function () {
			let items;
			if (localStorage.getItem('items') === null) {
				items = [];
			} else {
				//Get data from LS if exists
				items = JSON.parse(localStorage.getItem('items'));
			}
			return items;
		},
		updateItemStorage: function (updatedItem) {
			let items = JSON.parse(localStorage.getItem('items'));
			items.forEach((item, index) => {
				if (updatedItem.id === item.id) {
					items.splice(index, 1, updatedItem);
				}
			});
			localStorage.setItem('items', JSON.stringify(items));
		},
		deleteItemFromStorage: function (itemToDelete) {
			let items = JSON.parse(localStorage.getItem('items'));
			items.forEach((item, index) => {
				if (itemToDelete.id === item.id) {
					items.splice(index, 1);
				}
			});
			localStorage.setItem('items', JSON.stringify(items));
		},
		clearItemsFromStorage: function () {
			localStorage.removeItem('items');
		},
	};
})();
// ---------------------------------------------------------------------

// -- >  Item CONTROLLER
const ItemCtrl = (function () {
	//Item constructor
	const Item = function (id, name, calories) {
		this.id = id;
		this.name = name;
		this.calories = calories;
	};

	// Data structure (STATE)
	const data = {
		items: StorageCtrl.getItemsFromLS(),
		currentItem: null,
		totalCalories: 0,
	};

	return {
		getItems: function () {
			return data.items;
		},
		getItemByID: function (id) {
			return data.items.filter((item) => item.id === id)[0];
		},
		updateItem: function (name, calories) {
			calories = Number(calories);
			let found;

			data.items.forEach((item) => {
				if (item.id === data.currentItem.id) {
					item.name = name;
					item.calories = calories;
					found = item;
				}
			});
			return found;
		},
		deleteItem: function () {
			data.items = data.items.filter((item) => item.id !== data.currentItem.id);
		},
		clearAllItems: function () {
			data.items = [];
		},
		getTotalCalories: function () {
			data.totalCalories = data.items.reduce(
				(acc, item) => acc + item.calories,
				0
			);
			// Return data.totalCalories
			return data.totalCalories;
		},
		getCurrentItem: function () {
			return data.currentItem;
		},
		logData: function () {
			return data;
		},
		addItem: function (name, calories) {
			//Generate ID
			let ID;
			if (data.items.length > 0) {
				ID = data.items[data.items.length - 1].id + 1;
			} else {
				ID = 0;
			}
			//Create new Item
			const newItem = new Item(ID, name, Number(calories));
			//Push item to items array
			data.items.push(newItem);
			return newItem;
		},
		setCurrentItem: function (currentItem) {
			data.currentItem = currentItem;
		},
	};
})();

// ---------------------------------------------------------------------

// -- >  UI CONTROLLER
const UICtrl = (function () {
	//Private List of selectors
	const UISelectors = {
		itemList: '#item-list',
		listItems: '#item-list li',
		addBtn: '.add-btn',
		updateBtn: '.update-btn',
		deleteBtn: '.delete-btn',
		backBtn: '.back-btn',
		clearAllBtn: '.clear-btn',
		itemName: '#item-name',
		itemCalories: '#item-calories',
		totalCalories: '.total-calories',
	};

	return {
		populateItemList: function (items) {
			const html = items.reduce((acc, item) => {
				return (
					acc +
					`<li class="collection-item" id="item-${item.id}">
            <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
            <a href="#" class="secondary-content">
              <i class="edit-item fa fa-pencil-alt"></i>
            </a>
          </li>`
				);
			}, '');
			document.querySelector(UISelectors.itemList).innerHTML = html;
		},
		getSelectors: function () {
			return UISelectors;
		},
		getItemInput: function () {
			return {
				itemName: document.querySelector(UISelectors.itemName).value,
				itemCalories: document.querySelector(UISelectors.itemCalories).value,
			};
		},
		addListItem: function (item) {
			// Show the list
			document.querySelector(UISelectors.itemList).style.display = 'block';
			//Create li element
			const li = document.createElement('li');
			li.className = 'collection-item';
			li.id = `item-${item.id}`;
			// Add HTML
			li.innerHTML = `<strong>${item.name}: </strong> <em>${item.calories} Calories</em>
			<a href="#" class="secondary-content">
				<i class="edit-item fa fa-pencil-alt"></i>
			</a>`;
			//Insert item
			document
				.querySelector(UISelectors.itemList)
				.insertAdjacentElement('beforeend', li);
		},
		updateListItem: function (item) {
			let listItems = document.querySelectorAll(UISelectors.listItems);

			//Turn node-list to Array and update item
			[...listItems].forEach((listItem) => {
				const itemID = listItem.getAttribute('id');

				if (itemID === `item-${item.id}`) {
					document.querySelector(`#${itemID}`).innerHTML = `

						<strong>${item.name}: </strong> <em>${item.calories} Calories</em>
						<a href="#" class="secondary-content">
							<i class="edit-item fa fa-pencil-alt"></i>
						</a>

					`;
				}
			});
		},
		deleteListItem: function (item) {
			const listItem = document.querySelector(`#item-${item.id}`);
			listItem.remove();
		},
		removeItems: function () {
			let listItems = document.querySelectorAll(UISelectors.listItems);
			[...listItems].forEach((item) => item.remove());
		},
		clearInput: function () {
			document.querySelector(UISelectors.itemCalories).value = '';
			document.querySelector(UISelectors.itemName).value = '';
		},
		addItemToForm: function () {
			document.querySelector(
				UISelectors.itemName
			).value = ItemCtrl.getCurrentItem().name;
			document.querySelector(
				UISelectors.itemCalories
			).value = ItemCtrl.getCurrentItem().calories;
			UICtrl.showEditState();
		},
		hideList: function () {
			if (ItemCtrl.getItems().length < 1) {
				//hide UL
				document.querySelector(UISelectors.itemList).style.display = 'none';
			}
		},
		showTotalCalories: function (totalCalories) {
			document.querySelector(
				UISelectors.totalCalories
			).textContent = totalCalories;
		},
		showEditState: function () {
			document.querySelector(UISelectors.updateBtn).style.display = 'inline';
			document.querySelector(UISelectors.deleteBtn).style.display = 'inline';
			document.querySelector(UISelectors.backBtn).style.display = 'inline';
			document.querySelector(UISelectors.addBtn).style.display = 'none';
		},
		clearEditState: function () {
			UICtrl.clearInput();
			document.querySelector(UISelectors.updateBtn).style.display = 'none';
			document.querySelector(UISelectors.deleteBtn).style.display = 'none';
			document.querySelector(UISelectors.backBtn).style.display = 'none';
			document.querySelector(UISelectors.addBtn).style.display = 'inline';
		},
	};
})();

// ---------------------------------------------------------------------

// -- >  APP CONTROLLER
const App = (function (ItemCtrl, StorageCtrl, UICtrl) {
	//Load event listeners
	const loadEventListeners = function () {
		//get selectors
		const UISelectors = UICtrl.getSelectors();
		//Add item event
		document
			.querySelector(UISelectors.addBtn)
			.addEventListener('click', itemAddSubmit);

		//Disable Submit on ENTER
		document.addEventListener('keypress', function (e) {
			if (e.code === 'Enter') {
				e.preventDefault();
				return false;
			}
		});

		//Edit icon click event
		document
			.querySelector(UISelectors.itemList)
			.addEventListener('click', itemEditClick);

		//Update item event
		document
			.querySelector(UISelectors.updateBtn)
			.addEventListener('click', itemUpdateSubmit);

		//Back btn click event
		document
			.querySelector(UISelectors.backBtn)
			.addEventListener('click', (e) => {
				e.preventDefault();
				UICtrl.clearEditState();
			});

		//Delete item event
		document
			.querySelector(UISelectors.deleteBtn)
			.addEventListener('click', itemDeleteSubmit);

		//Clear ALL items event
		document
			.querySelector(UISelectors.clearAllBtn)
			.addEventListener('click', clearAllItemsSubmit);
	};

	//Add item submit
	const itemAddSubmit = function (e) {
		// Get form input from UICtrl
		const input = UICtrl.getItemInput();

		//Validate for valid input
		if (input.itemName !== '' && input.itemCalories !== '') {
			//Add item
			const newItem = ItemCtrl.addItem(input.itemName, input.itemCalories);
			//Add item to UI list
			UICtrl.addListItem(newItem);

			//Get total calories
			const totalCalories = ItemCtrl.getTotalCalories();
			// Add totalCalories to UI
			UICtrl.showTotalCalories(totalCalories);

			//Add item to LS
			StorageCtrl.storeItem(newItem);
			//Clear input fields
			UICtrl.clearInput();
		}

		e.preventDefault();
	};

	//Edit click
	const itemEditClick = function (e) {
		if (e.target.classList.contains('edit-item')) {
			// Get list item ID (item-0, item-1)
			const listId = e.target.parentElement.parentElement.id;
			const ID = Number(listId.split('-')[1]);

			//Get iten
			const itemToAdit = ItemCtrl.getItemByID(ID);
			// Set current item
			ItemCtrl.setCurrentItem(itemToAdit);

			// Add item to form
			UICtrl.addItemToForm();
		}
		e.preventDefault();
	};

	// Item Update submit
	const itemUpdateSubmit = function (e) {
		const input = UICtrl.getItemInput();
		//update item
		const updatedItem = ItemCtrl.updateItem(input.itemName, input.itemCalories);
		// Update UI
		UICtrl.updateListItem(updatedItem);

		//Get total calories
		const totalCalories = ItemCtrl.getTotalCalories();
		// Add totalCalories to UI
		UICtrl.showTotalCalories(totalCalories);

		//Update LS
		StorageCtrl.updateItemStorage(updatedItem);

		UICtrl.clearEditState();

		e.preventDefault();
	};

	//Item delete submit
	const itemDeleteSubmit = function (e) {
		//Delete item from data
		ItemCtrl.deleteItem();
		//Delete item from UI
		UICtrl.deleteListItem(ItemCtrl.getCurrentItem());

		//Get total calories
		const totalCalories = ItemCtrl.getTotalCalories();
		// Add totalCalories to UI
		UICtrl.showTotalCalories(totalCalories);

		//Delete from LS
		StorageCtrl.deleteItemFromStorage(ItemCtrl.getCurrentItem());

		UICtrl.clearEditState();

		e.preventDefault();
	};

	const clearAllItemsSubmit = function (e) {
		// Removing from UI and Data
		ItemCtrl.clearAllItems();
		UICtrl.removeItems();

		//Get total calories
		const totalCalories = ItemCtrl.getTotalCalories();
		// Add totalCalories to UI
		UICtrl.showTotalCalories(totalCalories);

		//Clear from LS
		StorageCtrl.clearItemsFromStorage();
		//Hide list
		UICtrl.hideList();

		e.preventDefault();
	};

	return {
		init: function () {
			//Set initial steate
			UICtrl.clearEditState();

			//fetch items from data structure
			const items = ItemCtrl.getItems();

			//Check if any items available
			if (items.length < 1) UICtrl.hideList();
			else {
				//populate list with items
				UICtrl.populateItemList(items);
			}
			//Get total calories
			const totalCalories = ItemCtrl.getTotalCalories();
			// Add totalCalories to UI
			UICtrl.showTotalCalories(totalCalories);

			//load listeners
			loadEventListeners();
		},
	};
})(ItemCtrl, StorageCtrl, UICtrl);

// ------ INIT -------
App.init();
