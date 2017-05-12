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
var EditPageComponent = (function () {
    function EditPageComponent(app) {
        this.app = app;
    }
    EditPageComponent.prototype.ngOnInit = function () {
        this.app.layout.store();
        this.app.layout.leftbar.open();
    };
    EditPageComponent.prototype.ngOnDestroy = function () {
        this.app.layout.restore();
    };
    EditPageComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            templateUrl: 'edit-page.component.html'
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof services_1.SysService !== 'undefined' && services_1.SysService) === 'function' && _a) || Object])
    ], EditPageComponent);
    return EditPageComponent;
    var _a;
}());
exports.EditPageComponent = EditPageComponent;
