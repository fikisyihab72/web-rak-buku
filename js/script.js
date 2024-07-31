const daftarBuku = [];
const RENDER_EVENT = 'render-buku';
const SAVED_EVENT = 'saved-buku';
const STORAGE_KEY = 'BOOKSHELF_APPS';


document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('form');
    const formSearch = document.getElementById("searchForm");
    submitForm.addEventListener('submit', function(event){
        event.preventDefault();
        addBuku();
    });

    formSearch.addEventListener("submit", function (event) {
        event.preventDefault();

        const inputJudul = document.getElementById("findBook").value;
        cariBuku(inputJudul);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
    
    toastFunction();
});

function addBuku(){
    const judulBuku = document.getElementById('title').value;
    const authorBuku = document.getElementById('author').value;
    const tahunBuku = parseInt(document.getElementById('year').value);

    const bukuId = generateId();

    const objectBuku = generateBukuObject(bukuId, judulBuku, authorBuku, tahunBuku, false);
    daftarBuku.push(objectBuku);
    console.log(objectBuku);

    document.dispatchEvent(new Event(RENDER_EVENT));
    let toastAction = 'tambah';
    saveData(toastAction);
}

function generateId(){
    return +new Date();
}

function generateBukuObject(id, title, author, year, isComplete){
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function saveData(toast){
    if(isStorageExist()){
        const parsed = JSON.stringify(daftarBuku);
        localStorage.setItem(STORAGE_KEY, parsed);

        if(toast == 'tambah'){
            let toast = document.getElementById("notifikasiTambahData");
            toast.innerHTML = 'Data Berhasil Ditambahkan';
            toast.style.backgroundColor = '#04AA6D';
            document.dispatchEvent(new Event(SAVED_EVENT));
        } else if (toast == 'check') {
            let toast = document.getElementById("notifikasiTambahData");
            toast.innerHTML = 'Buku Selesai Dibaca';
            toast.style.backgroundColor = '#008CBA';
            document.dispatchEvent(new Event(SAVED_EVENT));
        } else if (toast == 'undo') {
            let toast = document.getElementById("notifikasiTambahData");
            toast.innerHTML = 'Buku Berhasil di Uncheck';
            toast.style.backgroundColor = '#ba8b00';
            document.dispatchEvent(new Event(SAVED_EVENT));
        } else if (toast == 'delete') {
            let toast = document.getElementById("notifikasiTambahData");
            toast.innerHTML = 'Buku Telah Dihapus ';
            toast.style.backgroundColor = '#f44336';
            document.dispatchEvent(new Event(SAVED_EVENT));
        } 
        
        
    }
}


function isStorageExist(){
    if(typeof (Storage) === undefined){
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null){ 
        for (const buku of data){
            daftarBuku.push(buku);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function(){
    const uncompletedBUKUList = document.getElementById('daftarBukuBelumSelesai');
    uncompletedBUKUList.innerHTML = '';

    const completedBUKUList = document.getElementById('daftarBukuSudahSelesai');
    completedBUKUList.innerHTML = '';

    for (const buku of daftarBuku){
        const bukuElement = makeBuku(buku);
        if(!buku.isComplete){
            uncompletedBUKUList.append(bukuElement);
        } else {
            completedBUKUList.append(bukuElement);
        }
    }
});

function makeBuku(bukuObject) {
    const judulBuku = document.createElement('h2');
    judulBuku.innerText = bukuObject.title;
    judulBuku.classList.add("judulBuku");

    const authorBuku = document.createElement('p');
    authorBuku.innerText = bukuObject.author;

    const tahunBuku = document.createElement('p');
    tahunBuku.innerText = bukuObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(judulBuku, authorBuku, tahunBuku);

    const container = document.createElement('div');
    container.classList.add('bookList');
    container.append(textContainer);
    container.setAttribute('id', `buku-${bukuObject.id}`);

    if(bukuObject.isComplete){
        const undoButton = document.createElement('button');
        //undoButton.classList.add('undo-button');
        undoButton.innerText = 'Undo';
        undoButton.classList.add('undoButton');
        undoButton.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        
        undoButton.addEventListener('click', function(){
            undoBukuFromCompleted(bukuObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trashButton');
        trashButton.innerText = 'Hapus';
        trashButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';

        trashButton.addEventListener('click', function(){
            if (confirm('Apakah kamu yakin akan menghapus data?')) {
                // Save it!
                removeBukuFromCompleted(bukuObject.id);
              }      
        });

        const containerButtonCompleted = document.createElement('div');
        containerButtonCompleted.classList.add('buttonContainer');
        containerButtonCompleted.append(undoButton, trashButton);

        container.append(containerButtonCompleted);

    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('checkButton');
        checkButton.innerText = 'Check';
        checkButton.innerHTML = '<i class="fa-solid fa-check"></i>';

        checkButton.addEventListener('click', function(){
            addBukuToCompleted(bukuObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trashButton');
        trashButton.innerText = 'Hapus';
        trashButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
        
        trashButton.addEventListener('click', function(){
            if (confirm('Apakah kamu yakin akan menghapus data?')) {
                // Save it!
                removeBukuFromCompleted(bukuObject.id);
              }
            
        });

        const containerButtonUncompleted = document.createElement('div');
        containerButtonUncompleted.classList.add('buttonContainer');
        containerButtonUncompleted.append(checkButton, trashButton);

        container.append(containerButtonUncompleted);
    }
    
    return container;

}


function addBukuToCompleted(bukuId){
    const bukuTarget = findBuku(bukuId);

    if (bukuTarget == null) return;

    bukuTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    let toastAction = 'check';
    saveData(toastAction);
}

function findBuku(bukuId){
    for(const bukuItem of daftarBuku){
        if(bukuItem.id == bukuId){
            return bukuItem;
        }
    }
    return null;
}

function removeBukuFromCompleted(bukuId){
    const bukuTarget = findBukuIndex(bukuId);

    if (bukuTarget === -1) return;

    daftarBuku.splice(bukuTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    let toastAction = 'delete';
    saveData(toastAction);
}

function undoBukuFromCompleted(bukuId){
    const bukuTarget = findBuku(bukuId);

    if (bukuTarget == null) return;

    bukuTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    let toastAction = 'undo';
    saveData(toastAction);

}

function findBukuIndex(bukuId){
    for(const index in daftarBuku){
        if(daftarBuku[index].id === bukuId){
            return index;
        }
    }

    return -1;
}

function toastFunction() {
    let toast = document.getElementById("notifikasiTambahData");
  
    document.addEventListener(SAVED_EVENT, function () {
      toast.className = "show";
  
      setTimeout(function () {
        toast.className = toast.className.replace("show", "");
      }, 3000);
    });
  }


function cariBuku(parameterJudulBuku) {
    const judulInput = parameterJudulBuku.toLowerCase();
    const judulBookList = document.getElementsByClassName("bookList");

    for (const judulBook of judulBookList) {
        const judul = judulBook.innerText.toLowerCase();
        let displayStyle = "";
    
        if (judul.includes(judulInput.toLowerCase())) {
            displayStyle = "";
        } else {
            displayStyle = "none";
        }
        judulBook.closest(".bookList").style.display = displayStyle;
    }
}


