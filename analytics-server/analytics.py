#!/usr/bin/env python3
"""
Little Bloom - Time-Based Sales Analytics System
Complete Data Science implementation for Seller Dashboard
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import calendar
import logging

logger = logging.getLogger(__name__)

class TimeBasedSalesAnalytics:
    """Complete Time-Based Sales Analytics using Pandas & NumPy"""
    
    @staticmethod
    def process_dashboard_analytics(orders_data):
        """
        Complete dashboard analytics with Daily, Weekly, Monthly, Yearly breakdown
        
        Args:
            orders_data: List of order dictionaries with date, amount
            
        Returns:
            dict with daily, weekly, monthly, yearly analytics
        """
        try:
            if not orders_data:
                return TimeBasedSalesAnalytics._empty_analytics()
            
            # Convert to DataFrame
            df = pd.DataFrame(orders_data)
            df['date'] = pd.to_datetime(df['date'])
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
            
            # Extract time components
            df['weekday'] = df['date'].dt.day_name()
            df['weekday_num'] = df['date'].dt.dayofweek  # 0=Monday, 6=Sunday
            df['day'] = df['date'].dt.day
            df['week_of_month'] = ((df['day'] - 1) // 7) + 1
            df['month'] = df['date'].dt.month
            df['month_name'] = df['date'].dt.month_name()
            df['year'] = df['date'].dt.year
            
            # 1. DAILY ANALYSIS (Group by weekday)
            daily_analysis = TimeBasedSalesAnalytics._daily_analysis(df)
            
            # 2. WEEKLY ANALYSIS (Group by week of month)
            weekly_analysis = TimeBasedSalesAnalytics._weekly_analysis(df)
            
            # 3. MONTHLY ANALYSIS (Group by month)
            monthly_analysis = TimeBasedSalesAnalytics._monthly_analysis(df)
            
            # 4. YEARLY ANALYSIS (Group by year)
            yearly_analysis = TimeBasedSalesAnalytics._yearly_analysis(df)
            
            return {
                "daily": daily_analysis,
                "weekly": weekly_analysis,
                "monthly": monthly_analysis,
                "yearly": yearly_analysis,
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Dashboard analytics error: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def _daily_analysis(df):
        """Daily analysis grouped by weekday (Sun-Sat)"""
        # Group by weekday
        daily_grouped = df.groupby('weekday').agg({
            'amount': ['sum', 'count']
        }).round(2)
        
        # Reorder to Sun-Sat
        weekday_order = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        
        daily_result = []
        for day in weekday_order:
            if day in daily_grouped.index:
                revenue = float(daily_grouped.loc[day, ('amount', 'sum')])
                orders = int(daily_grouped.loc[day, ('amount', 'count')])
            else:
                revenue = 0
                orders = 0
            
            daily_result.append({
                "label": day[:3],  # Sun, Mon, Tue...
                "orders": orders,
                "revenue": revenue
            })
        
        return daily_result
    
    @staticmethod
    def _weekly_analysis(df):
        """Weekly analysis - each month split into Week 1-4"""
        # Group by year, month, week_of_month
        weekly_grouped = df.groupby(['year', 'month', 'week_of_month']).agg({
            'amount': ['sum', 'count']
        }).round(2)
        
        weekly_result = []
        for (year, month, week), row in weekly_grouped.iterrows():
            month_name = calendar.month_name[month]
            revenue = float(row[('amount', 'sum')])
            orders = int(row[('amount', 'count')])
            
            weekly_result.append({
                "label": f"{month_name} Week {week}",
                "orders": orders,
                "revenue": revenue,
                "year": year,
                "month": month,
                "week": week
            })
        
        return weekly_result
    
    @staticmethod
    def _monthly_analysis(df):
        """Monthly analysis - sum of all weeks per month"""
        # Group by year, month
        monthly_grouped = df.groupby(['year', 'month']).agg({
            'amount': ['sum', 'count']
        }).round(2)
        
        monthly_result = []
        for (year, month), row in monthly_grouped.iterrows():
            month_name = calendar.month_name[month]
            revenue = float(row[('amount', 'sum')])
            orders = int(row[('amount', 'count')])
            
            monthly_result.append({
                "label": month_name,
                "orders": orders,
                "revenue": revenue,
                "year": year,
                "month": month
            })
        
        return monthly_result
    
    @staticmethod
    def _yearly_analysis(df):
        """Yearly analysis - sum of all months per year"""
        # Group by year
        yearly_grouped = df.groupby('year').agg({
            'amount': ['sum', 'count']
        }).round(2)
        
        yearly_result = []
        for year, row in yearly_grouped.iterrows():
            revenue = float(row[('amount', 'sum')])
            orders = int(row[('amount', 'count')])
            
            yearly_result.append({
                "label": str(year),
                "orders": orders,
                "revenue": revenue,
                "year": year
            })
        
        return yearly_result
    
    @staticmethod
    def _empty_analytics():
        """Return empty analytics structure"""
        weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        return {
            "daily": [{"label": day, "orders": 0, "revenue": 0} for day in weekdays],
            "weekly": [],
            "monthly": [],
            "yearly": [],
            "status": "success"
        }
    
    @staticmethod
    def get_product_analysis(orders_data):
        """
        Product analysis for pie chart
        
        Args:
            orders_data: List with product_name and order count
            
        Returns:
            dict with product distribution
        """
        try:
            if not orders_data:
                return {"products": [], "status": "success"}
            
            # Convert to DataFrame
            df = pd.DataFrame(orders_data)
            
            # Group by product and sum orders
            if 'product_name' in df.columns and 'orders' in df.columns:
                product_grouped = df.groupby('product_name')['orders'].sum().sort_values(ascending=False)
                
                products = []
                for product, orders in product_grouped.items():
                    products.append({
                        "name": product,
                        "orders": int(orders)
                    })
                
                return {
                    "products": products,
                    "status": "success"
                }
            else:
                return {"products": [], "status": "success"}
                
        except Exception as e:
            logger.error(f"Product analysis error: {str(e)}")
            return {"error": str(e)}

# Test function
def test_analytics():
    """Test the analytics with sample data"""
    sample_orders = [
        {"date": "2026-04-01", "amount": 1500},
        {"date": "2026-04-02", "amount": 2000},
        {"date": "2026-04-06", "amount": 24493},
        {"date": "2026-04-07", "amount": 3000},
        {"date": "2026-04-10", "amount": 12000},
        {"date": "2026-04-15", "amount": 5000},
        {"date": "2026-04-22", "amount": 8000},
        {"date": "2026-05-01", "amount": 4000},
        {"date": "2026-05-15", "amount": 6000},
    ]
    
    result = TimeBasedSalesAnalytics.process_dashboard_analytics(sample_orders)
    
    print("=== ANALYTICS TEST RESULTS ===")
    print(f"Daily: {len(result['daily'])} entries")
    print(f"Weekly: {len(result['weekly'])} entries")
    print(f"Monthly: {len(result['monthly'])} entries")
    print(f"Yearly: {len(result['yearly'])} entries")
    
    print("\nDaily Analysis:")
    for day in result['daily']:
        print(f"  {day['label']}: {day['orders']} orders, ₹{day['revenue']}")
    
    print("\nWeekly Analysis:")
    for week in result['weekly']:
        print(f"  {week['label']}: {week['orders']} orders, ₹{week['revenue']}")
    
    print("\nMonthly Analysis:")
    for month in result['monthly']:
        print(f"  {month['label']}: {month['orders']} orders, ₹{month['revenue']}")
    
    print("\nYearly Analysis:")
    for year in result['yearly']:
        print(f"  {year['label']}: {year['orders']} orders, ₹{year['revenue']}")

if __name__ == "__main__":
    test_analytics()