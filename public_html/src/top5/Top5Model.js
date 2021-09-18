import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import MoveItem_Transaction from "./transactions/MoveItem_Transaction.js"

/**
 * Top5Model.js
 * 
 * This class provides access to all the data, meaning all of the lists. 
 * 
 * This class provides methods for changing data as well as access
 * to all the lists data.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Model {
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.top5Lists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;
    }

    getList(index) {
        return this.top5Lists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    setView(initView) {
        this.view = initView;
    }

    addNewList(initName, initItems) {
        let newList = new Top5List(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initItems)
            newList.setItems(initItems);
        this.top5Lists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        return newList;
    }

    sortLists() {
        this.top5Lists.sort((listA, listB) => {
            if (listA.getName() < listB.getName()) {
                return -1;
            }
            else if (listA.getName === listB.getName()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        this.view.refreshLists(this.top5Lists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            this.view.unhighlightList(list.id);
        }
    }

    loadList(id) {
        let list = null;
        let found = false;
        let i = 0;

        //Bug: This is for the bug if you click deleting transactions
        let oldId;
        if (this.currentList != null)
        {
            oldId = this.currentList.id;
        }

        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.update(this.currentList);
                this.view.highlightList(list.id);
                found = true;
            }
            i++;
        }

        //Bug: This is for the bug if you click deleting transactions
        if(oldId == null || oldId != this.currentList.id)
        {
            this.tps.clearAllTransactions();
        }
        this.view.updateToolbarButtons(this);
        let listCard = document.getElementById("close-button");
        listCard.classList.remove("disabled");
        listCard.disabled = false;
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        this.view.disableButton("close-button");
        this.view.updateToolbarButtons(this);
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.top5Lists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let items = [];
                for (let j = 0; j < listData.items.length; j++) {
                    items[j] = listData.items[j];
                }
                this.addNewList(listData.name, items);
            }
            this.sortLists();   
            this.view.refreshLists(this.top5Lists);   
            return true;
        }    
    }

    saveLists() {
        let top5ListsString = JSON.stringify(this.top5Lists);
        localStorage.setItem("recent_work", top5ListsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.items[id];
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    changeItem(id, text) {
        this.currentList.items[id] = text;
        this.view.update(this.currentList);
        this.saveLists();
    }

    //renames the list
    renameLists(id, text) {
        let index = this.getListIndex(id);
        let lst = this.getList(index);
        lst.name = text
        this.view.refreshLists(this.top5Lists);
        this.view.highlightList(this.currentList.id);
        this.saveLists();
    }

    // SIMPLE UNDO/REDO FUNCTIONS
    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }

    // REMOVE SPECIFIC INDEX IN LIST
    removeList(id)
    {
        //for (let i = 0; i < this.top5Lists.length; i++) 
        //{
        //    if(this.top5Lists[i].id === id)
        //    {
        //        this.top5Lists.splice(i, 1)
        //    }
        //}
        let index = this.getListIndex(id)
        this.top5Lists.splice(index, 1)
        this.view.refreshLists(this.top5Lists);
        if ( this.hasCurrentList() )
        {
            if( this.currentList.id == id)
            {
                this.view.clearWorkspace();
                this.clearStatus();
                this.view.enableButton("add-list-button");
                this.view.disableButton("close-button");
                this.tps.clearAllTransactions();
                this.view.updateToolbarButtons(this);
            }
            else
            {
                this.view.highlightList(this.currentList.id);
            }
        }
        
        this.saveLists();
    }

    // HIGHLIGHT LIST ON MOUSE
    mouseOver(id)
    {
        this.view.mousehighlightList(id);
    }
    // UNHIGHLIGHT
    unmouseOver(id)
    {
        this.view.mouseunhighlightList(id);
    }

    // IMPLEMENT THE DRAG AND DROP
    moveItem(oldid, newid)
    {
        this.currentList.moveItem(oldid - 1, newid - 1);
        this.restoreList();
        this.saveLists();
    }

    // SHOW THE LIST IN THE STATUS BAR
    showStatus(id)
    {
        let i = this.getListIndex(id);
        let list = this.getList(i);
        let txt = document.createTextNode("Top 5 " + list.getName());
        let p = document.getElementById("top5-statusbar");
        
        p.appendChild(txt);
    }

    // CLEAR THE VALUE IN THE STATUS BAR
    clearStatus()
    {
        document.getElementById("top5-statusbar").innerHTML = "";
    }

    moveItemTransaction = (moveId, dropId) => {
        let transaction = new MoveItem_Transaction(this, moveId, dropId);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }

    cancelButton()
    {
        this.clearStatus();
        this.view.unhighlightList(this.currentList.id);
        this.view.clearWorkspace();
        this.tps.clearAllTransactions();
        this.view.disableButton("close-button");
        this.view.updateToolbarButtons(this);
        this.view.enableButton("add-list-button");
        this.currentList = null;
        //listCard.disabled = true;
    }
}