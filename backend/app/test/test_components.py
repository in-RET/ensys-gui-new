import unittest

from InRetEnsys import *
from InRetEnsys.components import *
from InRetEnsys.types import Frequencies
from oemof import solph


class components(unittest.TestCase):

    def test_flow_simple(self):
        es = solph.EnergySystem()

        oe_flow = solph.Flow(
            nominal_value=103
        )

        ie_flow = InRetEnsysFlow(
            nominal_value=103
        ).to_oemof(es)
        
        for attr in oe_flow.__dict__:
            self.assertEqual(getattr(ie_flow, attr), getattr(oe_flow, attr)) 


    def test_flow_extended(self):
        es = solph.EnergySystem()

        oe_flow = solph.Flow(
            investment=solph.Investment(maximum=1024.42, minimum=0),
            nonconvex=solph.NonConvex(initial_status=0, minimum_uptime=12, maximum_startups=3)
        )

        ie_flow = InRetEnsysFlow(
            investment=InRetEnsysInvestment(maximum=1024.42, minimum=0),
            nonconvex=InRetEnsysNonConvex(initial_status=0, minimum_uptime=12, maximum_startups=3)
        ).to_oemof(es)
        
        for attr in oe_flow.__dict__:
            if attr in ["investment", "nonconvex"]:
                for subattr in getattr(oe_flow, attr).__dict__:
                    oe_obj = getattr(getattr(oe_flow, attr), subattr)
                    ie_obj = getattr(getattr(ie_flow, attr), subattr)

                    self.assertEqual(oe_obj, ie_obj)
            else:
                oe_obj = getattr(oe_flow, attr)
                ie_obj = getattr(ie_flow, attr)
                
                self.assertEqual(oe_obj, ie_obj) 


    def test_bus_extended(self):
        es = solph.EnergySystem()
        
        oe_bus = solph.Bus(label="Testbus", balanced=False)
        ie_bus = InRetEnsysBus(label="Testbus", balanced=False).to_oemof(es)

        for attr in oe_bus.__dict__:
            self.assertEqual(getattr(ie_bus, attr), getattr(ie_bus, attr)) 


    def test_sink_extended(self):
        es = solph.EnergySystem()
        es.add(
            solph.Bus(label="ie_bus")
        )

        oe_bus = solph.Bus(label="Testbus", balanced=False)
        
        oe_sink = solph.components.Sink(
            label="Testsink", 
            inputs={oe_bus: solph.Flow(nominal_value=1024.42)}
        )

        ie_sink = InRetEnsysSink(
            label="Testsink",
            inputs={"ie_bus": InRetEnsysFlow(nominal_value=1024.42)}
        ).to_oemof(es)

        for attr in oe_sink.__dict__:
            self.assertEqual(getattr(oe_sink, attr), getattr(ie_sink, attr)) 


    def test_source_extended(self):
        oe_bus = solph.Bus(label="ie_bus", balanced=False)
        
        es = solph.EnergySystem()
        es.add(oe_bus)        
        
        oe_source = solph.components.Source(
            label="Testsource", 
            outputs={oe_bus: solph.Flow(nominal_value=1024.42)}
        )

        ie_source = InRetEnsysSource(
            label="Testsource",
            outputs={"ie_bus": InRetEnsysFlow(nominal_value=1024.42)}
        ).to_oemof(es)

        for attr in oe_source.__dict__:
            self.assertEqual(getattr(oe_source, attr), getattr(ie_source, attr)) 


    def test_transformer_simple(self):
        oe_in = solph.Bus(label="ie_in", balanced=False)
        oe_out = solph.Bus(label="ie_out")

        es = solph.EnergySystem()
        es.add(
            oe_in,
            oe_out
        )
        
        oe_transformer = solph.components.Transformer(
            label="Transformer",
            inputs={oe_in: solph.Flow()},
            outputs={oe_out: solph.Flow()},
            conversion_factors={
                oe_in: 0.8,
                oe_out: 0.42
            }
        )

        ie_transformer = InRetEnsysTransformer(
            label="Transformer",
            inputs={"ie_in": InRetEnsysFlow()},
            outputs={"ie_out": InRetEnsysFlow()},
            conversion_factors={
                "ie_in": 0.8,
                "ie_out": 0.42
            }
        ).to_oemof(es)

        for attr in oe_transformer.__dict__:
            self.assertEqual(getattr(oe_transformer, attr), getattr(ie_transformer, attr)) 


    def test_genericstorage_simple(self):
        oe_in = solph.Bus(label="ie_in", balanced=False)
        oe_out = solph.Bus(label="ie_out")

        es = solph.EnergySystem()
        es.add(
            oe_in,
            oe_out
        )
        
        oe_storage = solph.components.GenericStorage(
            label="Storage",
            inputs={oe_in: solph.Flow()},
            outputs={oe_out: solph.Flow()},
            inflow_conversion_factor=0.8,
            outflow_conversion_factor=0.42
        )

        ie_storage = InRetEnsysStorage(
            label="Storage",
            inputs={"ie_in": InRetEnsysFlow()},
            outputs={"ie_out": InRetEnsysFlow()},
            inflow_conversion_factor=0.8,
            outflow_conversion_factor=0.42
        ).to_oemof(es)

        for attr in oe_storage.__dict__:
            self.assertEqual(getattr(oe_storage, attr), getattr(ie_storage, attr)) 



    def test_investment_extended(self):
        es = solph.EnergySystem()
        
        oe_invest = solph.Investment(maximum=1234, minimum=0, existing=512)
        ie_invest = InRetEnsysInvestment(maximum=1234, minimum=0, existing=512).to_oemof(es)

        for attr in oe_invest.__dict__:
            self.assertEqual(getattr(oe_invest, attr), getattr(ie_invest, attr))


    def test_nonconvex_extended(self):
        es = solph.EnergySystem()
        
        oe_nonconvex = solph.NonConvex(initial_status=0, minimum_uptime=12, minimum_downtime=6, maximum_startups=3, maximum_shutdowns=3)
        ie_nonconvex = InRetEnsysNonConvex(initial_status=0, minimum_uptime=12, minimum_downtime=6, maximum_startups=3, maximum_shutdowns=3).to_oemof(es)

        for attr in oe_nonconvex.__dict__:
            self.assertEqual(getattr(oe_nonconvex, attr), getattr(ie_nonconvex, attr))


    def test_energysystem_add(self):
        ie_es = InRetEnsysEnergysystem(frequenz=Frequencies.quarter_hourly, start_date="1/1/2022", time_steps=8192)

        ie_sink = InRetEnsysSink(
            label="Testsink",
            inputs={"ie_bus": InRetEnsysFlow(nominal_value=1024.42)}
        )
        ie_source = InRetEnsysSource(
            label="Testsource",
            outputs={"ie_bus": InRetEnsysFlow(nominal_value=1024.42)}
        )
        ie_bus = InRetEnsysBus(label="testbus")
        ie_storage = InRetEnsysStorage(
            label="Storage",
            inputs={"ie_in": InRetEnsysFlow()},
            outputs={"ie_out": InRetEnsysFlow()},
            inflow_conversion_factor=0.8,
            outflow_conversion_factor=0.42
        )
        ie_transformer = InRetEnsysTransformer(
            label="Transformer",
            inputs={"ie_in": InRetEnsysFlow()},
            outputs={"ie_out": InRetEnsysFlow()},
            conversion_factors={
                "ie_in": 0.8,
                "ie_out": 0.42
            }
        )
        ie_constraints = InRetEnsysConstraints()
        ie_invest = InRetEnsysInvestment(maximum=1234, minimum=0, existing=512)

        ie_es.add(ie_sink)
        ie_es.add(ie_source)
        ie_es.add(ie_bus)
        ie_es.add(ie_storage)
        ie_es.add(ie_transformer)
        ie_es.add(ie_constraints)
        self.assertRaises(Exception, ie_es.add)
