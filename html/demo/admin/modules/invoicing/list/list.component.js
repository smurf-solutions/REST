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
var material_1 = require('@angular/material');
var services_1 = require('@sys/services');
var services_2 = require('@sys/services');
var InvoicingConfig = require('./../invoicing.config.js');
var edit_modal_component_js_1 = require('./../edit/edit-modal.component.js');
var ListComponent = (function () {
    function ListComponent(app, collections, dialog) {
        this.app = app;
        this.collections = collections;
        this.dialog = dialog;
        this.dialogConfig = { disableClose: false,
            width: '600px', height: '', position: { top: '', bottom: '', left: '', right: '' }
        };
        this.listInfo = InvoicingConfig.listConfig;
        this.exportList = {};
    }
    ListComponent.prototype.editInvoiceModal = function (invoice) {
        var dialogRef = this.dialog.open(edit_modal_component_js_1.EditModalComponent, this.dialogConfig);
        if (invoice) {
            dialogRef.componentInstance.title = 'Редакция на фактура';
            dialogRef.componentInstance.invoice = invoice.data;
            dialogRef.componentInstance.customer = invoice.customer;
            dialogRef.componentInstance.payment = invoice.payment;
        }
        else {
            dialogRef.componentInstance.title = 'Нова фактура';
            dialogRef.componentInstance.invoice = {};
            dialogRef.componentInstance.customer = { company: {}, address: {}, contacts: {} };
            dialogRef.componentInstance.payment = {};
        }
    };
    ListComponent.prototype.ngOnInit = function () {
        this.load();
        this.app.restore(this, 'invoicing.listInvoices');
    };
    ListComponent.prototype.ngOnDestroy = function () {
        this.app.store(this, 'invoicing.listInvoices', ['http', 'invoices']);
    };
    ListComponent.prototype.load = function () {
        var _this = this;
        this.selected = null;
        this.collections
            .get('invoices')
            .subscribe(function (res) { return _this.invoices = res.data; });
    };
    ListComponent.prototype.getPagesNum = function () {
        return Math.ceil(this.listInfo.founded / this.listInfo.perPage);
    };
    ListComponent.prototype.select = function (invoice) {
        this.selected = invoice;
        this.app.layout.leftbar.close();
        if (this.invoicing_bar)
            this.invoicing_bar.open();
    };
    __decorate([
        core_1.ViewChild('invoicing_bar'), 
        __metadata('design:type', Object)
    ], ListComponent.prototype, "invoicing_bar");
    ListComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            styleUrls: ['list.component.css'],
            templateUrl: 'list.component.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof services_1.SysService !== 'undefined' && services_1.SysService) === 'function' && _a) || Object, (typeof (_b = typeof services_2.CollectionsService !== 'undefined' && services_2.CollectionsService) === 'function' && _b) || Object, (typeof (_c = typeof material_1.MdDialog !== 'undefined' && material_1.MdDialog) === 'function' && _c) || Object])
    ], ListComponent);
    return ListComponent;
    var _a, _b, _c;
}());
exports.ListComponent = ListComponent;
