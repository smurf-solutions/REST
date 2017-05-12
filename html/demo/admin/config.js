"use strict";
exports.DEMO = true;
exports.Navigation = [
    {
        title: 'Base',
        icon: 'storage',
        children: [
            { title: 'Фактури',
                desc: 'Преглед и редакция на Фактури',
                path: 'Invoicing'
            },
            { title: 'Клиенти',
                desc: 'Управление на клиентите',
                path: 'Customers'
            },
            { title: 'Продукти',
                desc: 'Управление на продуктите',
                path: 'Store/Products'
            },
            { title: 'Разходи*',
                desc: 'Разходни Фактури',
                path: 'Expences/Invoices'
            },
            { title: 'Доставчици*',
                desc: '',
                path: 'Contragents/Supplyers'
            },
            { title: 'Персонал*',
                desc: '',
                path: 'Employees/List'
            },
            { title: 'Автопарк*',
                desc: '',
                path: 'Automobiles'
            }
        ]
    },
    {
        title: 'Activity',
        icon: 'play_for_work',
        children: [
            { title: 'Хелпдеск',
                path: '/Helpdesk/Tickets'
            },
            { title: 'Продажби',
                desc: 'Управлениена продажбите',
                path: '/Invoicing/Sells'
            },
            { title: 'Покупки',
                desc: 'Управление на разходите',
                path: '/Expenses'
            },
            { title: 'Ремонти *',
                path: '/Transfers'
            },
            { title: 'Трансфери *',
                path: '/Transfers'
            },
            { title: 'Превози *',
                path: '/Prevoz'
            },
        ]
    },
    { title: 'Analyses',
        icon: 'trending_up',
        children: [
            { title: 'Търговски',
                path: '/Invoicing/Reports'
            },
            { title: 'Склад',
                path: '/Store/Reports'
            },
            { title: 'Персонал',
                path: '/Employees/Reports'
            }
        ]
    },
    {
        title: 'Admin',
        icon: 'tune',
        children: [
            { title: 'Потребители',
                path: '/Admin/Users'
            }
        ]
    }
];
exports.Routing = [
    { path: '', redirectTo: '/Home', pathMatch: 'full' },
    { path: 'Home', loadChildren: 'modules/home/home.module.js#HomeModule' },
    { path: 'Invoicing', loadChildren: 'modules/invoicing/invoicing.module.js#InvoicingModule' },
    { path: 'Customers', loadChildren: 'modules/customers/customers.module.js#CustomersModule' },
    { path: 'Contragents/Supplyers', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Store/Products', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Employees/List', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Helpdesk/Tickets', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Invoicing/Sells', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Expenses', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Invoicing/Reports', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Store/Reports', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Employees/Reports', loadChildren: 'modules/not-installed/not-installed.js#NotInstalledModule' },
    { path: 'Admin/Users', loadChildren: 'modules/admin-users/admin-users.module.js#AdminUsersModule' },
];
exports.Styles = [
    "css/themes/indigo-pink.min.css",
    "css/themes/indigo-pink.+.css",
    "css/table.data.css",
    "css/table.list.css",
    "app.component.css"
];
