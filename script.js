let records =
    JSON.parse(localStorage.getItem("landRecords")) || [];

let deletedRecords =
    JSON.parse(localStorage.getItem("deletedRecords")) || [];

let logs =
    JSON.parse(localStorage.getItem("systemLogs")) || [];

let paymentQueue =
    JSON.parse(localStorage.getItem("paymentQueue")) || [];


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveData() {

    localStorage.setItem(
        "landRecords",
        JSON.stringify(records)
    );

    localStorage.setItem(
        "deletedRecords",
        JSON.stringify(deletedRecords)
    );

    localStorage.setItem(
        "systemLogs",
        JSON.stringify(logs)
    );

    localStorage.setItem(
        "paymentQueue",
        JSON.stringify(paymentQueue)
    );
}


/* =========================================================
   TAX CALCULATION
   ========================================================= */

function calculateTax(area, location) {

    let rate;

    let type;


    if (area <= 10) {

        type = "Residential (Bastu)";

        rate = 1.0;

    }

    else if (area <= 50) {

        type = "Agricultural Land";

        rate = 0.5;

    }

    else if (area <= 100) {

        type = "Commercial Land";

        rate = 2.0;

    }

    else {

        type = "Industrial / Large Land";

        rate = 3.5;
    }


    if (
        location === "Urban" ||
        location === "urban"
    ) {

        rate += 1.0;
    }

    else if (
        location === "Rural" ||
        location === "rural"
    ) {

        rate -= 0.2;
    }


    return {

        type: type,

        tax: area * rate
    };
}


/* =========================================================
   LOGGING
   ========================================================= */

function pushLog(message) {

    logs.unshift({

        message: message,

        time: new Date().toLocaleString()
    });


    saveData();

    renderLogs();
}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


/* =========================================================
   LOGIN
   ========================================================= */

document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;


        if (
            username === "MOFASA" &&
            password === "MOFASA123"
        ) {

            document
                .getElementById("loginPage")
                .classList.add("hidden");

            document
                .getElementById("app")
                .classList.remove("hidden");


            showToast("Access Granted");

            updateDashboard();

        }

        else {

            document
                .getElementById("loginMessage")
                .textContent =
                "Invalid username or password!";
        }

    });


/* =========================================================
   LOGOUT
   ========================================================= */

document
    .getElementById("logoutBtn")
    .addEventListener("click", function () {

        document
            .getElementById("app")
            .classList.add("hidden");

        document
            .getElementById("loginPage")
            .classList.remove("hidden");


        document
            .getElementById("password")
            .value = "";

    });


/* =========================================================
   NAVIGATION
   ========================================================= */

const navigationButtons =
    document.querySelectorAll(
        "[data-section]"
    );


navigationButtons.forEach(button => {

    button.addEventListener("click", function () {

        const section =
            this.dataset.section;


        document
            .querySelectorAll(".section")
            .forEach(sec => {

                sec.classList.remove(
                    "active-section"
                );

            });


        document
            .getElementById(section)
            .classList.add(
                "active-section"
            );


        document
            .querySelectorAll(".nav-btn")
            .forEach(btn => {

                btn.classList.remove("active");

            });


        const navButton =
            document.querySelector(
                `.nav-btn[data-section="${section}"]`
            );


        if (navButton) {

            navButton.classList.add("active");
        }


        const titles = {

            dashboard: "Dashboard",

            khotiyan:
                "Khotiyan Management",

            payments:
                "Dakhila Payments",

            search:
                "Search Record",

            logs:
                "System Logs",

            reports:
                "Reports"
        };


        document
            .getElementById("pageTitle")
            .textContent =
            titles[section];


        if (section === "khotiyan") {

            renderRecords();
        }

        if (section === "payments") {

            renderPaymentQueue();
        }

        if (section === "logs") {

            renderLogs();
        }

        if (section === "reports") {

            renderDeletedRecords();
        }

    });

});


/* =========================================================
   ADD RECORD FORM SHOW/HIDE
   ========================================================= */

document
    .getElementById("showAddForm")
    .addEventListener("click", function () {

        document
            .getElementById("addFormContainer")
            .classList.remove("hidden");

    });


document
    .getElementById("cancelAdd")
    .addEventListener("click", function () {

        document
            .getElementById("addFormContainer")
            .classList.add("hidden");


        document
            .getElementById("landForm")
            .reset();


        document
            .getElementById("taxPreview")
            .classList.add("hidden");

    });


/* =========================================================
   TAX PREVIEW
   ========================================================= */

function updateTaxPreview() {

    const area =
        parseFloat(
            document.getElementById("area").value
        );


    const location =
        document.getElementById("location").value;


    if (
        isNaN(area) ||
        area <= 0 ||
        location === ""
    ) {

        document
            .getElementById("taxPreview")
            .classList.add("hidden");

        return;
    }


    const result =
        calculateTax(area, location);


    document
        .getElementById("taxPreview")
        .classList.remove("hidden");


    document
        .getElementById("detectedType")
        .textContent =
        result.type;


    document
        .getElementById("previewTax")
        .textContent =
        "৳" + result.tax.toFixed(2);
}


document
    .getElementById("area")
    .addEventListener(
        "input",
        updateTaxPreview
    );


document
    .getElementById("location")
    .addEventListener(
        "change",
        updateTaxPreview
    );


/* =========================================================
   ADD NEW LAND RECORD
   ========================================================= */

document
    .getElementById("landForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const id =
            parseInt(
                document.getElementById("landId").value
            );


        const refName =
            document.getElementById("refName").value;


        const placeName =
            document.getElementById("placeName").value;


        const area =
            parseFloat(
                document.getElementById("area").value
            );


        const location =
            document.getElementById("location").value;


        /* Duplicate ID check */

        const duplicate =
            records.some(
                record => record.id === id
            );


        if (duplicate) {

            showToast(
                "Khotiyan ID already exists!"
            );

            return;
        }


        const taxData =
            calculateTax(
                area,
                location
            );


        const record = {

            id: id,

            refName: refName,

            placeName: placeName,

            area: area,

            location: location,

            areaName: taxData.type,

            tax: taxData.tax,

            paidAmount: 0
        };


        records.unshift(record);


        saveData();


        pushLog(
            "New Khotiyan Node Added - ID " +
            id
        );


        renderRecords();

        updateDashboard();


        document
            .getElementById("landForm")
            .reset();


        document
            .getElementById("taxPreview")
            .classList.add("hidden");


        document
            .getElementById("addFormContainer")
            .classList.add("hidden");


        showToast(
            "Record added successfully!"
        );

    });


/* =========================================================
   RENDER RECORDS
   ========================================================= */

function renderRecords(searchTerm = "") {

    const tbody =
        document.getElementById(
            "landTableBody"
        );


    tbody.innerHTML = "";


    let filteredRecords =
        records;


    if (searchTerm.trim() !== "") {

        const search =
            searchTerm.toLowerCase();


        filteredRecords =
            records.filter(record =>

                record.id.toString()
                    .includes(search) ||

                record.refName
                    .toLowerCase()
                    .includes(search) ||

                record.placeName
                    .toLowerCase()
                    .includes(search)
            );
    }


    if (filteredRecords.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8"
                    style="text-align:center;padding:30px">

                    No records found.

                </td>

            </tr>

        `;

        return;
    }


    filteredRecords.forEach(record => {

        const due =
            Math.max(
                0,
                record.tax -
                record.paidAmount
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${record.id}</strong>
            </td>

            <td>${record.refName}</td>

            <td>${record.placeName}</td>

            <td>${record.areaName}</td>

            <td>${record.area}</td>

            <td class="paid">
                ৳${record.paidAmount.toFixed(2)}
            </td>

            <td class="due">
                ৳${due.toFixed(2)}
            </td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteRecord(${record.id})">

                    Delete

                </button>

            </td>
        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   DELETE RECORD
   ========================================================= */

function deleteRecord(id) {

    const index =
        records.findIndex(
            record => record.id === id
        );


    if (index === -1) {

        return;
    }


    const record =
        records[index];


    const confirmed =
        confirm(
            `Delete Khotiyan ID ${id}?`
        );


    if (!confirmed) {

        return;
    }


    /* Store in recycle bin */

    deletedRecords.unshift(record);


    /* Remove from active records */

    records.splice(index, 1);


    saveData();


    pushLog(
        "Node Deleted - ID " + id
    );


    renderRecords();

    updateDashboard();

    renderDeletedRecords();


    showToast(
        "Record deleted successfully."
    );

}


/* =========================================================
   TABLE SEARCH
   ========================================================= */

document
    .getElementById("tableSearch")
    .addEventListener("input", function () {

        renderRecords(this.value);

    });


/* =========================================================
   PAYMENT ID INFORMATION
   ========================================================= */

document
    .getElementById("paymentId")
    .addEventListener("input", function () {

        const id =
            parseInt(this.value);


        const record =
            records.find(
                r => r.id === id
            );


        const info =
            document.getElementById(
                "paymentInfo"
            );


        if (!record) {

            info.classList.add("hidden");

            return;
        }


        const due =
            Math.max(
                0,
                record.tax -
                record.paidAmount
            );


        info.innerHTML = `

            <strong>${record.refName}</strong>

            <br>

            Total Tax:
            ৳${record.tax.toFixed(2)}

            <br>

            Paid:
            ৳${record.paidAmount.toFixed(2)}

            <br>

            Due:
            <strong>
                ৳${due.toFixed(2)}
            </strong>

        `;


        info.classList.remove("hidden");

    });


/* =========================================================
   ADD PAYMENT TO QUEUE
   ========================================================= */

document
    .getElementById("paymentForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();


        const id =
            parseInt(
                document.getElementById(
                    "paymentId"
                ).value
            );


        const amount =
            parseFloat(
                document.getElementById(
                    "paymentAmount"
                ).value
            );


        const record =
            records.find(
                r => r.id === id
            );


        if (!record) {

            showToast(
                "Invalid Khotiyan ID!"
            );

            return;
        }


        if (
            isNaN(amount) ||
            amount <= 0
        ) {

            showToast(
                "Invalid payment amount!"
            );

            return;
        }


        paymentQueue.push({

            id: id,

            amount: amount,

            time:
                new Date().toLocaleString()
        });


        saveData();


        renderPaymentQueue();


        this.reset();


        document
            .getElementById("paymentInfo")
            .classList.add("hidden");


        showToast(
            "Payment added to queue."
        );

    });


/* =========================================================
   RENDER PAYMENT QUEUE
   ========================================================= */

function renderPaymentQueue() {

    const container =
        document.getElementById(
            "paymentQueue"
        );


    const count =
        document.getElementById(
            "queueCount"
        );


    count.textContent =
        paymentQueue.length;


    container.innerHTML = "";


    if (paymentQueue.length === 0) {

        container.innerHTML = `

            <p style="
                text-align:center;
                color:#6b7280;
                padding:30px;
            ">

                Payment queue is empty.

            </p>
        `;

        return;
    }


    paymentQueue.forEach(
        (payment, index) => {

            const record =
                records.find(
                    r => r.id === payment.id
                );


            const div =
                document.createElement("div");


            div.className =
                "queue-item";


            div.innerHTML = `

                <div>

                    <strong>
                        ID: ${payment.id}
                    </strong>

                    <br>

                    <small>
                        ${record
                    ? record.refName
                    : "Unknown"
                }
                    </small>

                </div>

                <strong>
                    ৳${payment.amount.toFixed(2)}
                </strong>

            `;


            container.appendChild(div);

        }
    );

}


/* =========================================================
   PROCESS QUEUE
   ========================================================= */

document
    .getElementById("processQueueBtn")
    .addEventListener(
        "click",
        processPayments
    );


function processPayments() {

    if (paymentQueue.length === 0) {

        showToast(
            "Payment queue is empty."
        );

        return;
    }


    paymentQueue.forEach(payment => {

        const record =
            records.find(
                r => r.id === payment.id
            );


        if (record) {

            record.paidAmount +=
                payment.amount;
        }

    });


    paymentQueue = [];


    saveData();


    pushLog(
        "Payments Processed"
    );


    renderPaymentQueue();

    renderRecords();

    updateDashboard();


    showToast(
        "All payments processed successfully."
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        searchRecord
    );


document
    .getElementById("searchId")
    .addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchRecord();

            }

        }
    );


function searchRecord() {

    const id =
        parseInt(
            document.getElementById(
                "searchId"
            ).value
        );


    const record =
        records.find(
            r => r.id === id
        );


    const result =
        document.getElementById(
            "searchResult"
        );


    if (!record) {

        result.innerHTML = `

            <div class="panel">

                <h3>Record Not Found</h3>

                <p>
                    No Khotiyan record exists
                    with ID ${id}.
                </p>

            </div>

        `;

        return;
    }


    const due =
        Math.max(
            0,
            record.tax -
            record.paidAmount
        );


    result.innerHTML = `

        <div class="record-details">

            <h3>
                Khotiyan Record #${record.id}
            </h3>

            <div class="detail-grid">

                <div class="detail-item">

                    <span>Reference Name</span>

                    <strong>
                        ${record.refName}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Place</span>

                    <strong>
                        ${record.placeName}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Land Type</span>

                    <strong>
                        ${record.areaName}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Area</span>

                    <strong>
                        ${record.area} Decimal
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Location</span>

                    <strong>
                        ${record.location}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Total Tax</span>

                    <strong>
                        ৳${record.tax.toFixed(2)}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Paid</span>

                    <strong class="paid">
                        ৳${record.paidAmount.toFixed(2)}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Due</span>

                    <strong class="due">
                        ৳${due.toFixed(2)}
                    </strong>

                </div>

            </div>

        </div>
    `;

}


/* =========================================================
   SYSTEM LOGS
   ========================================================= */

function renderLogs() {

    const container =
        document.getElementById(
            "logsContainer"
        );


    container.innerHTML = "";


    if (logs.length === 0) {

        container.innerHTML = `

            <p style="
                text-align:center;
                padding:30px;
                color:#6b7280;
            ">

                No logs found.

            </p>

        `;

        return;
    }


    logs.forEach(log => {

        const div =
            document.createElement("div");


        div.className =
            "log-item";


        div.innerHTML = `

            <span class="log-text">

                ✓ ${log.message}

            </span>

            <span class="log-time">

                ${log.time}

            </span>

        `;


        container.appendChild(div);

    });

}


/* =========================================================
   CLEAR LOGS
   ========================================================= */

document
    .getElementById("clearLogsBtn")
    .addEventListener(
        "click",
        function () {

            if (
                !confirm(
                    "Clear all system logs?"
                )
            ) {

                return;
            }


            logs = [];


            saveData();

            renderLogs();


            showToast(
                "Logs cleared."
            );

        }
    );


/* =========================================================
   DELETED RECORDS
   ========================================================= */

function renderDeletedRecords() {

    const container =
        document.getElementById(
            "deletedRecordsList"
        );


    container.innerHTML = "";


    if (deletedRecords.length === 0) {

        container.innerHTML = `

            <p style="
                color:#6b7280;
                padding:15px;
            ">

                No deleted records.

            </p>

        `;

        return;
    }


    deletedRecords.forEach(record => {

        const div =
            document.createElement("div");


        div.className =
            "deleted-item";


        div.innerHTML = `

            <strong>
                ID: ${record.id}
            </strong>

            &nbsp; | &nbsp;

            Name: ${record.refName}

            &nbsp; | &nbsp;

            Place: ${record.placeName}

        `;


        container.appendChild(div);

    });

}


/* =========================================================
   REPORT GENERATOR
   ========================================================= */

document
    .getElementById("generateReportBtn")
    .addEventListener(
        "click",
        generateReport
    );


function generateReport() {

    let reportName =
        document.getElementById(
            "reportName"
        ).value.trim();


    const date =
        document.getElementById(
            "reportDate"
        ).value;


    if (reportName === "") {

        reportName =
            "Official_Land_Report";
    }


    if (!date) {

        showToast(
            "Please select a report date."
        );

        return;
    }


    let report = "";


    report +=
        "========== OFFICIAL LAND REPORT ==========\n";

    report +=
        "Report Date: " +
        date +
        "\n\n";


    report +=
        "ACTIVE RECORDS:\n\n";


    report +=
        "ID\tName\tPlace\tLand Type\tArea\tPaid\tDue\n";


    report +=
        "------------------------------------------------------------\n";


    records.forEach(record => {

        const due =
            Math.max(
                0,
                record.tax -
                record.paidAmount
            );


        report +=

            record.id + "\t" +

            record.refName + "\t" +

            record.placeName + "\t" +

            record.areaName + "\t" +

            record.area + "\t" +

            record.paidAmount.toFixed(2) +
            "\t" +

            due.toFixed(2) +

            "\n";

    });


    report +=
        "\n\nDELETED RECORDS:\n";


    deletedRecords.forEach(record => {

        report +=

            "ID: " +
            record.id +

            " | Name: " +
            record.refName +

            " | Place: " +
            record.placeName +

            "\n";

    });


    /* Download */

    const blob =
        new Blob(
            [report],
            {
                type: "text/plain"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        reportName +
        "_" +
        date +
        ".txt";


    link.click();


    URL.revokeObjectURL(url);


    pushLog(
        "Official Land Report Generated"
    );


    showToast(
        "Report generated successfully!"
    );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    document
        .getElementById("totalRecords")
        .textContent =
        records.length;


    const totalPaid =
        records.reduce(
            (sum, record) =>
                sum + record.paidAmount,
            0
        );


    const totalDue =
        records.reduce(
            (sum, record) => {

                return sum +
                    Math.max(
                        0,
                        record.tax -
                        record.paidAmount
                    );

            },
            0
        );


    document
        .getElementById("totalPaid")
        .textContent =
        "৳" +
        totalPaid.toFixed(2);


    document
        .getElementById("totalDue")
        .textContent =
        "৳" +
        totalDue.toFixed(2);


    document
        .getElementById("deletedRecords")
        .textContent =
        deletedRecords.length;


    renderRecentRecords();

}


/* =========================================================
   RECENT RECORDS
   ========================================================= */

function renderRecentRecords() {

    const container =
        document.getElementById(
            "recentRecords"
        );


    container.innerHTML = "";


    const recent =
        records.slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML = `

            <p style="
                color:#6b7280;
                padding:20px 0;
            ">

                No records available.

            </p>

        `;

        return;
    }


    recent.forEach(record => {

        const div =
            document.createElement("div");


        div.className =
            "recent-item";


        div.innerHTML = `

            <div>

                <div class="recent-name">

                    ${record.refName}

                </div>

                <div class="recent-id">

                    Khotiyan ID:
                    ${record.id}

                </div>

            </div>


            <strong class="paid">

                ৳${record.paidAmount.toFixed(2)}

            </strong>

        `;


        container.appendChild(div);

    });

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document
    .getElementById("reportDate")
    .value =
    new Date()
        .toISOString()
        .split("T")[0];


updateDashboard();

renderRecords();

renderPaymentQueue();

renderLogs();

renderDeletedRecords();
