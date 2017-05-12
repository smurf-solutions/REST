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
var list_module_js_1 = require('./list/list.module.js');
var view_module_js_1 = require('./view/view.module.js');
var edit_module_js_1 = require('./edit/edit.module.js');
var export_module_js_1 = require('./export/export.module.js');
var settings_module_js_1 = require('./settings/settings.module.js');
var InvoicingModule = (function () {
    function InvoicingModule() {
    }
    InvoicingModule = __decorate([
        core_1.NgModule({
            imports: [
                router_1.RouterModule.forChild([{ path: '', redirectTo: '/Invoicing/List', pathMatch: 'full' }]),
                list_module_js_1.ListModule,
                view_module_js_1.ViewModule,
                edit_module_js_1.EditModule,
                settings_module_js_1.SettingsModule,
                export_module_js_1.ExportModule
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], InvoicingModule);
    return InvoicingModule;
}());
exports.InvoicingModule = InvoicingModule;
