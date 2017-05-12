"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var modules_js_1 = require('@sys/modules.js');
var admin_users_list_component_js_1 = require('./list/admin-users-list.component.js');
var AdminUsersModule = (function () {
    function AdminUsersModule() {
    }
    AdminUsersModule = __decorate([
        core_1.NgModule({
            imports: [
                modules_js_1.SysModules,
                router_1.RouterModule.forChild([{ path: '', component: admin_users_list_component_js_1.AdminUsersListComponent }]),
            ],
            declarations: [admin_users_list_component_js_1.AdminUsersListComponent],
            exports: [admin_users_list_component_js_1.AdminUsersListComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AdminUsersModule);
    return AdminUsersModule;
}());
exports.AdminUsersModule = AdminUsersModule;
