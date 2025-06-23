from enum import Enum


class Constraints(Enum):
    """
    Represents a collection of constraints that can be applied to a model in the context of
    optimization problems. These constraints encompass various types of bounds and limits, allowing
    the user to define investments, flow restrictions, and active flow management to match specific
    use cases or requirements effectively.

    :ivar shared_limit: Adds a constraint to the given model that restricts the weighted sum of
        variables to a corridor.
    :type shared_limit: str
    :ivar investment_limit: Sets an absolute limit for the total investment costs of an investment
        optimization problem.
    :type investment_limit: str
    :ivar additional_investment_flow_limit: Global limit for investment flows weighted by an
        attribute keyword. This constraint is only valid for Flows, not for components such as an
        investment storage. The attribute named by the keyword must be added to every Investment
        attribute of the flow to be considered. The total value of keyword attributes after
        optimization can be retrieved by calling `oemof.solph.Model.invest_limit_${keyword}`.
        (Mathematically represented as: Σ (P_i * w_i) ≤ limit, where IF is the set of
        InvestmentFlows considered for the integral limit.)
    :type additional_investment_flow_limit: str
    :ivar generic_integral_limit: Sets a global limit for flows weighted by an attribute called a
        keyword. The attribute named by the keyword must be added to every flow considered.
    :type generic_integral_limit: str
    :ivar emission_limit: Short handle for `generic_integral_limit()` with `keyword="emission_factor"`.
    :type emission_limit: str
    :ivar limit_active_flow_count: Sets limits (lower and/or upper) for the number of concurrently
        active NonConvex flows. The flows are provided as a list.
    :type limit_active_flow_count: str
    :ivar limit_active_flow_count_by_keyword: Wrapper for `limit_active_flow_count` that allows setting
        limits to the count of concurrently active flows by using a keyword instead of a list. The
        constraint will be named as `${keyword}_count`.
    :type limit_active_flow_count_by_keyword: str
    :ivar equate_variables: Ensures that specified variables within the optimization problem are
        treated as equivalent.
    :type equate_variables: str
    """
    shared_limit = 'shared_limit'
    investment_limit = 'investment_limit'
    additional_investment_flow_limit = 'additional_investment_flow_limit'
    generic_integral_limit = 'generic_integral_limit'
    emission_limit = 'emission_limit'
    limit_active_flow_count = 'limit_active_flow_count'
    limit_active_flow_count_by_keyword = 'limit_active_flow_count_by_keyword'
    equate_variables = 'equate_variables'


class Interval(Enum):
    """
    Represents various fixed time intervals available for use.

    This class is an enumeration that defines specific time intervals as constants,
    describing their corresponding durations in hours. The intervals are represented
    as descriptive names and associated with their numerical values (in fractional
    hours). These values can be leveraged to standardize time-related calculations.

    :ivar quarter_hourly: Represents a timestep of 15 minutes.
    :type quarter_hourly: float
    :ivar half_hourly: Represents a timestep of 30 minutes.
    :type half_hourly: float
    :ivar hourly: Represents a timestep of 60 minutes.
    :type hourly: int
    """
    quarter_hourly = 0.25
    half_hourly = 0.5
    hourly = 1


class Solver(Enum):
    """
    Represents enumeration of different solvers available for mathematical programming.

    The class provides a list of solvers used in optimization problems. These include
    different solvers for linear programming and mixed-integer linear programming. It
    allows explicit references to specific solvers and can be helpful for choosing the
    most compatible solver for a given optimization task.

    :ivar cbc: COIN-OR Branch-and-Cut Solver.
    :type cbc: str
    :ivar gurobi: Gurobi MILP Solver.
    :type gurobi: str
    :ivar gurobi_direct: Gurobi MILP Solver (Direct interface).
    :type gurobi_direct: str
    :ivar gurobi_persistent: Gurobi MILP Solver (Persistent interface).
    :type gurobi_persistent: str
    :ivar glpk: GNU Linear Programming Kit Solver.
    :type glpk: str
    :ivar cplex: IBM ILOG CPLEX Optimization Solver.
    :type cplex: str
    :ivar kiwi: Kiwisolver from PyPI.
    :type kiwi: str
    """
    cbc = 'cbc'
    gurobi = 'gurobi'
    gurobi_direct = 'gurobi_direct'
    gurobi_persistent = 'gurobi_persistent'
    glpk = 'glpk'
    cplex = 'cplex'
    kiwi = 'kiwi'
