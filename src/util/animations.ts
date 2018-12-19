import { trigger,style,transition,animate,keyframes,query,stagger } from '@angular/animations';

export const bounceIn  =  trigger('listAnimation', [
    transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),
        query(':enter', stagger('200ms', [
            animate('.5s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(100%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(10px)',  offset: 0.5}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
            ]))]), {optional: true})
    ])
]);

export const slideIn = trigger('ItemsAnimation', [
    transition('* => *', [
        query('.item', style({ opacity: 0, transform: 'translateX(-40px)' })),
        query('.item', stagger('200ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
        ])),
        query('.item', [
            animate(1000, style('*'))
        ])
    ])
]);

export const listSlideUp = trigger('ListItemsAnimation', [
    transition('* => *', [
        query('ion-list', style({ opacity: 0, transform: 'translateY(40px)' })),
        query('ion-list', stagger('200ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
        ])),
        query('ion-list', [
            animate(1000, style('*'))
        ])
    ])
]);

export const itemSlideUp = trigger('ItemsAnimation', [
    transition('* => *', [
        query('ion-item', style({ opacity: 0, transform: 'translateY(40px)' })),
        query('ion-item', stagger('200ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
        ])),
        query('ion-item', [
            animate(1000, style('*'))
        ])
    ])
]);

