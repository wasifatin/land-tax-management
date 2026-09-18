#include <iostream>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <string>
#include <cstdlib>
#include <conio.h>

using namespace std;

/* =========================================================
   LAND NODE - DOUBLY LINKED LIST
   ========================================================= */

struct LandNode
{
    int khotiyanID;
    string refName;
    string placeName;
    string areaName;
    double area;
    double paidAmount;

    LandNode *next;
    LandNode *prev;

    LandNode()
    {
        next = nullptr;
        prev = nullptr;
        area = 0;
        paidAmount = 0;
    }
};

/* =========================================================
   QUEUE NODE
   ========================================================= */

struct QueueNode
{
    int id;
    double amount;
    QueueNode *next;

    QueueNode(int i, double a)
    {
        id = i;
        amount = a;
        next = nullptr;
    }
};

/* =========================================================
   DAKHILA QUEUE
   ========================================================= */

struct DakhilaQueue
{
    QueueNode *front;
    QueueNode *rear;

    DakhilaQueue()
    {
        front = nullptr;
        rear = nullptr;
    }
};

/* =========================================================
   STACK NODE - SYSTEM LOGS
   ========================================================= */

struct StackNode
{
    string entry;
    StackNode *next;

    StackNode(string msg)
    {
        entry = msg;
        next = nullptr;
    }
};

/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

LandNode *head = nullptr;
LandNode *deletedHead = nullptr;

StackNode *historyStack = nullptr;

DakhilaQueue paymentQueue;

/* =========================================================
   HEADER
   ========================================================= */

void header(string title)
{

    cout << "\n========== GOVT LAND PORTAL ==========\n";
    cout << "=========== " << title << " ===========\n\n";
}

/* =========================================================
   WAIT FOR ENTER
   ========================================================= */

void waitForEnter()
{

    cout << "\nPress Enter to continue...";

    cin.ignore(10000, '\n');
    cin.get();
}

/* =========================================================
   RECYCLE BIN LOGIC
   ========================================================= */

void storeDeleted(LandNode *node)
{

    LandNode *copy = new LandNode();

    copy->khotiyanID = node->khotiyanID;
    copy->refName = node->refName;
    copy->placeName = node->placeName;
    copy->areaName = node->areaName;
    copy->area = node->area;
    copy->paidAmount = node->paidAmount;

    copy->next = deletedHead;
    copy->prev = nullptr;

    deletedHead = copy;
}

/* =========================================================
   FILE OPERATIONS
   ========================================================= */

void saveAll()
{

    ofstream file("records.txt");

    if (!file)
    {
        cout << "Error opening records.txt\n";
        return;
    }

    LandNode *temp = head;

    while (temp != nullptr)
    {

        file << temp->khotiyanID << "|"
             << temp->refName << "|"
             << temp->placeName << "|"
             << temp->areaName << "|"
             << fixed << setprecision(2)
             << temp->area << "|"
             << temp->paidAmount << "\n";

        temp = temp->next;
    }

    file.close();
}

/* =========================================================
   LOAD DATA FROM FILE
   ========================================================= */

void loadAll()
{

    ifstream file("records.txt");

    if (!file)
    {
        return;
    }

    string line;

    while (getline(file, line))
    {

        if (line.empty())
            continue;

        stringstream ss(line);

        string id;
        string refName;
        string placeName;
        string areaName;
        string area;
        string paid;

        getline(ss, id, '|');
        getline(ss, refName, '|');
        getline(ss, placeName, '|');
        getline(ss, areaName, '|');
        getline(ss, area, '|');
        getline(ss, paid, '|');

        LandNode *node = new LandNode();

        node->khotiyanID = stoi(id);
        node->refName = refName;
        node->placeName = placeName;
        node->areaName = areaName;
        node->area = stod(area);
        node->paidAmount = stod(paid);

        node->next = head;
        node->prev = nullptr;

        if (head != nullptr)
        {
            head->prev = node;
        }

        head = node;
    }

    file.close();
}

/* =========================================================
   TAX CALCULATION
   ========================================================= */

double calculateTax(double area, string &type, string location)
{

    double rate;

    if (area <= 10)
    {

        type = "Residential (Bastu)";
        rate = 1.0;
    }

    else if (area <= 50)
    {

        type = "Agricultural Land";
        rate = 0.5;
    }

    else if (area <= 100)
    {

        type = "Commercial Land";
        rate = 2.0;
    }

    else
    {

        type = "Industrial / Large Land";
        rate = 3.5;
    }

    if (location == "Urban" || location == "urban")
    {

        rate += 1.0;
    }

    else if (location == "Rural" || location == "rural")
    {

        rate -= 0.2;
    }

    return area * rate;
}

/* =========================================================
   LOGGING - STACK
   ========================================================= */

void pushLog(string msg)
{

    StackNode *node = new StackNode(msg);

    node->next = historyStack;

    historyStack = node;
}

/* =========================================================
   VIEW SYSTEM LOGS
   ========================================================= */

void viewLogs()
{

    system("cls");

    header("SYSTEM LOGS");

    StackNode *temp = historyStack;

    if (temp == nullptr)
    {

        cout << "\nNo Logs Found\n";
    }

    while (temp != nullptr)
    {

        cout << "-> " << temp->entry << endl;

        temp = temp->next;
    }

    waitForEnter();
}

/* =========================================================
   SEARCH BY ID
   ========================================================= */

LandNode *findByID(int id)
{

    LandNode *temp = head;

    while (temp != nullptr)
    {

        if (temp->khotiyanID == id)
        {

            return temp;
        }

        temp = temp->next;
    }

    return nullptr;
}

/* =========================================================
   SEARCH MENU
   ========================================================= */

void searchByID()
{

    system("cls");

    header("SEARCH BY ID");

    int id;

    cout << "\nEnter ID: ";
    cin >> id;

    LandNode *temp = findByID(id);

    if (temp != nullptr)
    {

        string type;

        double tax =
            calculateTax(temp->area, type, temp->areaName);

        double due = tax - temp->paidAmount;

        cout << "\nFound Record:\n";

        cout << "ID: " << temp->khotiyanID << endl;
        cout << "Name: " << temp->refName << endl;
        cout << "Place: " << temp->placeName << endl;
        cout << "Area Type: " << temp->areaName << endl;
        cout << "Total Tax: "
             << fixed << setprecision(2)
             << tax << endl;

        cout << "Paid: "
             << temp->paidAmount << endl;

        cout << "Due: "
             << due << endl;
    }

    else
    {

        cout << "\nNot Found\n";
    }

    waitForEnter();
}

/* =========================================================
   KHOTIYAN MANAGEMENT
   ========================================================= */

void khotiyanPriorityModule()
{

    int choice;
    int id;

    while (true)
    {

        system("cls");

        header("KHOTIYAN MANAGEMENT");

        cout << "Current Sequence: ";

        LandNode *temp = head;

        if (temp == nullptr)
        {

            cout << "[Empty]";
        }

        while (temp != nullptr)
        {

            cout << "[ID:"
                 << temp->khotiyanID
                 << "] <-> ";

            temp = temp->next;
        }

        cout << "NULL\n";

        cout << "\n1. Insert New Record\n";
        cout << "2. Delete Record\n";
        cout << "3. Back\n";

        cout << "Choice: ";
        cin >> choice;

        /* =================================================
           INSERT
           ================================================= */

        if (choice == 1)
        {

            LandNode *node = new LandNode();

            cout << "\nID: ";
            cin >> node->khotiyanID;

            /* Check duplicate ID */

            if (findByID(node->khotiyanID) != nullptr)
            {

                cout << "\nID already exists!\n";

                delete node;

                waitForEnter();

                continue;
            }

            cout << "Reference Name: ";
            cin.ignore(10000, '\n');
            getline(cin, node->refName);

            cout << "Place Name: ";
            getline(cin, node->placeName);

            cout << "Area (Decimal): ";
            cin >> node->area;

            node->paidAmount = 0;

            string type;
            string location;

            cout << "Enter location (Urban/Rural): ";
            cin >> location;

            double tax =
                calculateTax(node->area, type, location);

            node->areaName = type;

            /* Insert at beginning */

            node->next = head;
            node->prev = nullptr;

            if (head != nullptr)
            {

                head->prev = node;
            }

            head = node;

            cout << "\n--- Calculation Summary ---\n";

            cout << "Detected Land Type: "
                 << node->areaName << endl;

            cout << "Total Tax Payable: "
                 << fixed << setprecision(2)
                 << tax << endl;

            cout << "Record Inserted Successfully!\n";

            pushLog("New Khotiyan Node Added");

            waitForEnter();
        }

        /* =================================================
           DELETE
           ================================================= */

        else if (choice == 2)
        {

            cout << "\nEnter ID to delete: ";
            cin >> id;

            LandNode *curr = findByID(id);

            if (curr == nullptr)
            {

                cout << "Not Found\n";
            }

            else
            {

                /* Save copy to recycle bin */

                storeDeleted(curr);

                /* Fix previous node */

                if (curr->prev != nullptr)
                {

                    curr->prev->next = curr->next;
                }

                /* Fix next node */

                if (curr->next != nullptr)
                {

                    curr->next->prev = curr->prev;
                }

                /* If deleting head */

                if (curr == head)
                {

                    head = curr->next;
                }

                delete curr;

                pushLog("Node Deleted");

                cout << "Deleted Successfully\n";
            }

            waitForEnter();
        }

        else if (choice == 3)
        {

            break;
        }

        else
        {

            cout << "\nInvalid Choice!\n";

            waitForEnter();
        }
    }
}

/* =========================================================
   QUEUE - ENQUEUE
   ========================================================= */

void enqueueDakhila(int id, double amount)
{

    QueueNode *node =
        new QueueNode(id, amount);

    if (paymentQueue.rear == nullptr)
    {

        paymentQueue.front = node;
        paymentQueue.rear = node;

        return;
    }

    paymentQueue.rear->next = node;

    paymentQueue.rear = node;
}

/* =========================================================
   PROCESS DAKHILA QUEUE
   ========================================================= */

void processDakhilas()
{

    system("cls");

    header("DAKHILA QUEUE");

    int n;
    int id;

    double amount;

    cout << "How many payments to queue: ";
    cin >> n;

    for (int i = 0; i < n; i++)
    {

        cout << "\n[" << i + 1 << "] Enter ID: ";
        cin >> id;

        LandNode *land = findByID(id);

        if (land == nullptr)
        {

            cout << "Invalid ID! Skipping...\n";

            i--;

            continue;
        }

        string type;

        double tax =
            calculateTax(
                land->area,
                type,
                land->areaName);

        double due =
            tax - land->paidAmount;

        cout << "Account: "
             << land->refName << endl;

        cout << "Total Tax: "
             << fixed << setprecision(2)
             << tax;

        cout << " | Paid so far: "
             << land->paidAmount;

        cout << " | Remaining Due: "
             << due << endl;

        cout << "Enter Payment Amount: ";
        cin >> amount;

        if (amount <= 0)
        {

            cout << "Invalid payment amount!\n";

            i--;

            continue;
        }

        enqueueDakhila(id, amount);
    }

    /* =====================================================
       PROCESS QUEUE
       ===================================================== */

    cout << "\n--- Processing Queue ---\n";

    while (paymentQueue.front != nullptr)
    {

        QueueNode *q =
            paymentQueue.front;

        LandNode *land =
            findByID(q->id);

        if (land != nullptr)
        {

            land->paidAmount += q->amount;

            string type;

            double tax =
                calculateTax(
                    land->area,
                    type,
                    land->areaName);

            double newDue =
                tax - land->paidAmount;

            cout << "Processed ID "
                 << land->khotiyanID;

            cout << ": New Paid Total: "
                 << fixed << setprecision(2)
                 << land->paidAmount;

            cout << " (New Due: "
                 << newDue
                 << ")\n";
        }

        paymentQueue.front =
            q->next;

        delete q;
    }

    paymentQueue.rear = nullptr;

    pushLog("Payments Processed");

    waitForEnter();
}

/* =========================================================
   REPORT GENERATOR
   ========================================================= */

void generateFullReport()
{

    string filename;
    string namePart;
    string datePart;

    system("cls");

    header("REPORT GENERATOR");

    cout << "Enter report name: ";

    cin.ignore(10000, '\n');

    getline(cin, namePart);

    cout << "Enter date (DD-MM-YYYY): ";

    getline(cin, datePart);

    filename =
        namePart + "_" +
        datePart + ".txt";

    ofstream file(filename);

    if (!file)
    {

        cout << "\nUnable to create report!\n";

        waitForEnter();

        return;
    }

    file << "========== OFFICIAL LAND REPORT ==========\n";

    file << "Report Date: "
         << datePart << "\n\n";

    file << "ACTIVE RECORDS:\n";

    file << left
         << setw(10) << "ID"
         << setw(20) << "Name"
         << setw(15) << "Paid"
         << setw(10) << "Due"
         << "\n";

    LandNode *temp = head;

    while (temp != nullptr)
    {

        string type;

        double tax =
            calculateTax(
                temp->area,
                type,
                temp->areaName);

        double due =
            tax - temp->paidAmount;

        file << left
             << setw(10)
             << temp->khotiyanID

             << setw(20)
             << temp->refName

             << setw(15)
             << fixed << setprecision(2)
             << temp->paidAmount

             << setw(10)
             << due

             << "\n";

        temp = temp->next;
    }

    /* =====================================================
       DELETED RECORDS
       ===================================================== */

    file << "\nDELETED RECORDS:\n";

    temp = deletedHead;

    while (temp != nullptr)
    {

        file << "ID:"
             << temp->khotiyanID

             << " | Name:"
             << temp->refName

             << "\n";

        temp = temp->next;
    }

    file.close();

    cout << "\nReport saved as "
         << filename << endl;

    waitForEnter();
}

/* =========================================================
   PRINT ALL RECORDS
   ========================================================= */

void printAllKhotiyans()
{

    system("cls");

    header("ALL KHOTIYAN RECORDS");

    LandNode *temp = head;

    if (temp == nullptr)
    {

        cout << "No records found\n";
    }

    while (temp != nullptr)
    {

        string type;

        double tax =
            calculateTax(
                temp->area,
                type,
                temp->areaName);

        double due =
            tax - temp->paidAmount;

        cout << "ID:"
             << setw(5)
             << temp->khotiyanID;

        cout << " Name:"
             << setw(15)
             << temp->refName;

        cout << " Tax:"
             << setw(8)
             << fixed << setprecision(2)
             << tax;

        cout << " Paid:"
             << setw(8)
             << temp->paidAmount;

        cout << " Due:"
             << due
             << "\n";

        temp = temp->next;
    }

    waitForEnter();
}

/* =========================================================
   PASSWORD INPUT
   ========================================================= */

void getPassword(string &password)
{

    char ch;

    password = "";

    while (true)
    {

        ch = _getch();

        /* ENTER */

        if (ch == 13)
        {

            break;
        }

        /* BACKSPACE */

        if (ch == 8)
        {

            if (!password.empty())
            {

                password.pop_back();

                cout << "\b \b";
            }
        }

        /* NORMAL CHARACTER */

        else
        {

            password += ch;

            cout << '*';
        }
    }
}

/* =========================================================
   SECURITY TERMINAL
   ========================================================= */

bool securityTerminal()
{

    string username;
    string password;

    int attempt = 0;

    while (attempt < 3)
    {

        system("cls");

        header("ADMIN LOGIN");

        cout << "Username: ";

        cin >> username;

        cout << "Password: ";

        getPassword(password);

        if (
            username == "MOFASA" &&
            password == "MOFASA123")
        {

            cout << "\n\nAccess Granted!\n";

            _getch();

            return true;
        }

        attempt++;

        cout << "\n\nAccess Denied! ("
             << 3 - attempt
             << " attempts left)\n";

        _getch();
    }

    return false;
}

/* =========================================================
   MAIN
   ========================================================= */

int main()
{

    /* Load saved records */

    loadAll();

    /* Admin Login */

    if (!securityTerminal())
    {

        return 0;
    }

    int choice;

    while (true)
    {

        system("cls");

        header("MAIN MENU");

        cout << "1. Khotiyan Management (Add/Delete)\n";

        cout << "2. Process Dakhila Queue (Payments)\n";

        cout << "3. View System Logs\n";

        cout << "4. Print All Records\n";

        cout << "5. Search by ID\n";

        cout << "6. Generate Full Report (.txt)\n";

        cout << "7. Save & Exit\n";

        cout << "\nChoice: ";

        cin >> choice;

        switch (choice)
        {

        case 1:

            khotiyanPriorityModule();

            break;

        case 2:

            processDakhilas();

            break;

        case 3:

            viewLogs();

            break;

        case 4:

            printAllKhotiyans();

            break;

        case 5:

            searchByID();

            break;

        case 6:

            generateFullReport();

            break;

        case 7:

            saveAll();

            cout << "\nData saved successfully.\n";

            return 0;

        default:

            cout << "\nInvalid Choice!\n";

            waitForEnter();
        }
    }

    return 0;
}
