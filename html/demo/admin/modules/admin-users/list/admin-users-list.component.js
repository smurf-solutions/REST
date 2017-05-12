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
var services_1 = require('@sys/services');
var services_2 = require('@sys/services');
var ng2_toasty_1 = require('ng2-toasty');
var AdminUsersListComponent = (function () {
    function AdminUsersListComponent(app, collections, toasty) {
        this.app = app;
        this.collections = collections;
        this.toasty = toasty;
        this.users = [];
    }
    AdminUsersListComponent.prototype.ngOnInit = function () {
        this.load();
    };
    AdminUsersListComponent.prototype.load = function () {
        var _this = this;
        this.collections
            .get('system.users')
            .subscribe(function (res) { return _this.users = res.data; });
    };
    AdminUsersListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: 'admin-users-list.component.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof services_1.SysService !== 'undefined' && services_1.SysService) === 'function' && _a) || Object, (typeof (_b = typeof services_2.CollectionsService !== 'undefined' && services_2.CollectionsService) === 'function' && _b) || Object, ng2_toasty_1.ToastyService])
    ], AdminUsersListComponent);
    return AdminUsersListComponent;
    var _a, _b;
}());
exports.AdminUsersListComponent = AdminUsersListComponent;
