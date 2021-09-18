/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
            //console.log(this.model);
        }

        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }

        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }

        document.getElementById("close-button").onmousedown = (event) => {
            this.model.cancelButton();
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput); // changes to input

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            //console.log(event);
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                    }
                    textInput.onblur = (event) => {
                        //this.model.restoreList();
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                    }
                }
            }
            item.draggable = true;
            item.ondragstart = (event) =>
            {
                event.dataTransfer.setData("text", event.target.id);
                //console.log(event.dataTransfer.getData("text"))
            }
            item.ondragover = (event) =>
            {
                event.preventDefault();
            }
            item.ondrop = (event) =>
            {
                event.preventDefault();
                let data = event.dataTransfer.getData("text");
                let num = data.substring(data.indexOf('-') + 1);
                let num1 = event.target.id.substring(event.target.id.indexOf('-') + 1);
                //this.model.moveAround(num, num1);
                this.model.moveItemTransaction(num, num1);
            }
        }
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
            this.model.loadList(id);

            // 
            this.model.clearStatus();
            let listCard = document.getElementById("add-list-button");
            listCard.classList.add("disabled");
            listCard.disabled = true;
            this.model.showStatus(id);
        }
        // MOUSE OVER
        document.getElementById("top5-list-" + id).onmouseover = (event) => {
            this.model.mouseOver(id);
        }
        // UN-MOUSE OVER
        document.getElementById("top5-list-" + id).onmouseout = (event) => {
            this.model.unmouseOver(id);
        }

        //RENAME LIST
        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            //this.ignoreParentClick(event);
            let list = document.getElementById("top5-list-" + id);
            //console.log(this.model);

            // CLEAR THE TEXT
            list.innerHTML = "";

            // ADD A TEXT FIELD
            let textInput = document.createElement("input");
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "top5-list-input-" + id);
            textInput.setAttribute("value", this.model.currentList.getName());
            
            //adds parent with child
            list.appendChild(textInput); // changes to input

            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    //console.log(event);
                    //console.log(this.model);
                    this.model.renameLists(id, event.target.value);
                    this.model.clearStatus();
                    this.model.showStatus(id);
                }
            }
            textInput.onblur = (event) => {
                //this.model.restoreList();
                this.model.renameLists(id, event.target.value);
                this.model.clearStatus();
                this.model.showStatus(id);
            }
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = this.model.getListIndex(id);
            let listName = this.model.getList(this.listToDeleteIndex).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");

            document.getElementById("dialog-confirm-button").onmousedown = (event) => {
                //this.ignoreParentClick(event);
                //console.log(this.model);
                this.model.removeList(id);
                modal.classList.remove("is-visible");
            }
            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                //this.ignoreParentClick(event);
                modal.classList.remove("is-visible");
            }
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}