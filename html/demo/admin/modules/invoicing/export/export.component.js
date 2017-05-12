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
var ExportComponent = (function () {
    function ExportComponent(app) {
        this.app = app;
        this.exportList = { dump: [] };
    }
    ExportComponent.prototype.ngOnInit = function () {
        this.app.restore(this, 'invoicing.listInvoices');
        this.app.layout.store();
        this.app.layout.leftbar.close();
    };
    ExportComponent.prototype.ngOnDestroy = function () {
        this.app.layout.restore();
    };
    ExportComponent.prototype.print = function () { window.print(); };
    ExportComponent.prototype.email = function () {
        var content = encodeURIComponent(document.getElementsByClassName('list-container')[0].innerHTML);
        content = 'hi';
        window.open('mailto:test@example.com?subject=subject&body=' + content);
    };
    ExportComponent.prototype._download_ = function (filename, content) {
        filename = 'Фактура.html';
        content = document.getElementsByClassName('list-container')[0].innerHTML;
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };
    ExportComponent.prototype.download = function (id, filename) {
        filename = 'Фактури.html';
        content = document.getElementById(id).innerHTML;
        var blob = new Blob([content], { type: 'text/html' });
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        }
        else {
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    };
    ExportComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            styleUrls: ['export.component.css'],
            templateUrl: 'export.component.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof services_1.SysService !== 'undefined' && services_1.SysService) === 'function' && _a) || Object])
    ], ExportComponent);
    return ExportComponent;
    var _a;
}());
exports.ExportComponent = ExportComponent;
