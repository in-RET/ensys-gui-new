from enum import Enum

## File which contains all enumeration of the package.
#
#   @file


## Enumeration for all selectable Constraints which can be added to an PyOmo-Model.
#
class Constraints(Enum):
    ## Adds a constraint to the given model that restricts the weighted sum of variables to a corridor.
    shared_limit = 'shared_limit'
    ## Set an absolute limit for the total investment costs of an investment optimization problem:
    investment_limit = 'investment_limit'
    ## Global limit for investment flows weighted by an attribute keyword.
    #  This constraint is only valid for Flows not for components such as an investment storage.
    #  The attribute named by keyword has to be added to every Investment attribute of the flow you want to take into account. Total value of keyword attributes after optimization can be retrieved calling the oemof.solph.Model.invest_limit_${keyword}().
    #  \f[ {\sum_{i \in IF}  P_i \cdot w_i \leq limit} \f]
    # With IF being the set of InvestmentFlows considered for the integral limit.
    additional_investment_flow_limit = 'additional_investment_flow_limit'
    ## Set a global limit for flows weighted by attribute called keyword. The attribute named by keyword has to be added to every flow you want to take into account.
    generic_integral_limit = 'generic_integral_limit'
    ## Short handle for generic_integral_limit() with keyword=”emission_factor”.
    emission_limit = 'emission_limit'
    ## Set limits (lower and/or upper) for the number of concurrently active NonConvex flows. The flows are given as a list.
    limit_active_flow_count = 'limit_active_flow_count'
    ## This wrapper for limit_active_flow_count allows to set limits to the count of concurrently active flows by using a keyword instead of a list. The constraint will be named $(keyword)_count.
    limit_active_flow_count_by_keyword = 'limit_active_flow_count_by_keyword'
    ## Adds a constraint to the given model that set two variables to equal adaptable by a factor.
    equate_variables = 'equate_variables'


## Enumeration for the frequenz of the pandas.date_range needed by the oemof energysystem.
#
class Interval(Enum):
    ## Timestep is 15 Minutes
    quarter_hourly = 0.25

    ## Timestep is 30 Minutes
    half_hourly = 0.5

    ## Timestep is 60 Minutes
    hourly = 1



## Enumeration for all selectable solvers.
#
#   gurobi is the default solver of a InRetEnsys-Model, but it requires a license.
#   cbc is freely available but not so performant.
class Solver(Enum):
    ## COIN-OR Branch-and-Cut Solver
    cbc = 'cbc'

    ## Gurobi MILP Solver
    gurobi = 'gurobi'

    ## Gurobi MILP Solver
    gurobi_direct = 'gurobi_direct'

    ## Gurobis MILP Solver
    gurobi_persistent = 'gurobi_persistent'

    ## GNU Linear Programming Kit Solver
    glpk = 'glpk'

    ## IBM ILOG CPLEX Optimization
    cplex = 'cplex'

    ## kiwisolver from pypi
    kiwi = 'kiwi'
