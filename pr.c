#include<stdio.h>
#include<stdlib.h>

int greeting(int n){
    if(n==0)
    return 0 ;
    greeting(n-1);
    printf(n);
    greeting(n-1);
}

int main(){
    int n;
    printf("Enetr the number n:");
    scanf("%d",&n);
    greeting(n);
    return 0;
}